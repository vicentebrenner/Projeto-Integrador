package com.musicMakers.Projeto.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Envia e-mails via API HTTP do Resend (https://resend.com), em vez de SMTP.
 * Plataformas como o Render bloqueiam conexões SMTP de saída (portas 25/465/587) por
 * padrão anti-spam — a API HTTP do Resend roda sobre HTTPS (porta 443), que não é bloqueada.
 */
@Service
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final RestTemplate restTemplate = criarRestTemplateComTimeout();

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from-email}")
    private String remetente;

    /**
     * Envia o e-mail de redefinição de senha em segundo plano (fora da thread da requisição HTTP).
     * Uma chamada HTTP pode demorar ou falhar (rede, chave invalida, limite excedido) — se fosse
     * síncrona aqui, a requisição de /forgot-password ficaria pendurada em "Processando..." até
     * a resposta chegar. Falhas de envio são logadas e engolidas aqui de propósito: quem chama
     * (PasswordResetService) já respondeu a mensagem genérica ao usuário antes disso rodar.
     */
    public void enviarEmailRedefinicaoSenha(String destinatario, String nomeUsuario, String linkRedefinicao) {
        CompletableFuture.runAsync(() -> {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(apiKey);
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> corpo = Map.of(
                    "from", remetente,
                    "to", List.of(destinatario),
                    "subject", "Redefinição de senha - MusicMakers",
                    "html", construirHtml(nomeUsuario, linkRedefinicao)
                );

                restTemplate.postForEntity(RESEND_API_URL, new HttpEntity<>(corpo, headers), String.class);
            } catch (RestClientException e) {
                System.err.println("Falha ao enviar e-mail de redefinição de senha para " + destinatario + ": " + e.getMessage());
            }
        });
    }

    private static RestTemplate criarRestTemplateComTimeout() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory =
            new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        return new RestTemplate(factory);
    }

    private String construirHtml(String nome, String link) {
        String primeiroNome = (nome == null || nome.trim().isEmpty()) ? "" : nome.trim().split(" ")[0];
        return "<!DOCTYPE html>"
            + "<html lang=\"pt-BR\">"
            + "<head><meta charset=\"UTF-8\"></head>"
            + "<body style=\"margin:0;padding:0;background-color:#12121a;font-family:Arial,Helvetica,sans-serif;\">"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#12121a;padding:40px 0;\">"
            + "<tr><td align=\"center\">"
            + "<table role=\"presentation\" width=\"480\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#1c1c26;border-radius:16px;overflow:hidden;border:1px solid #2c2c3a;\">"
            + "<tr><td style=\"padding:32px 32px 0 32px;text-align:center;\">"
            + "<span style=\"font-size:22px;font-weight:700;color:#fa9848;letter-spacing:0.5px;\">MusicMakers</span>"
            + "</td></tr>"
            + "<tr><td style=\"padding:24px 32px 8px 32px;\">"
            + "<h1 style=\"color:#ffffff;font-size:20px;margin:0 0 16px 0;\">Redefinição de senha</h1>"
            + "<p style=\"color:#c7c7d1;font-size:15px;line-height:1.6;margin:0 0 8px 0;\">"
            + "Olá" + (primeiroNome.isEmpty() ? "" : ", " + escaparHtml(primeiroNome)) + "!</p>"
            + "<p style=\"color:#c7c7d1;font-size:15px;line-height:1.6;margin:0 0 24px 0;\">"
            + "Recebemos uma solicitação para redefinir a senha da sua conta no MusicMakers. "
            + "Clique no botão abaixo para criar uma nova senha. Este link expira em 30 minutos.</p>"
            + "</td></tr>"
            + "<tr><td style=\"padding:0 32px 32px 32px;text-align:center;\">"
            + "<a href=\"" + link + "\" style=\"display:inline-block;background-color:#fa9848;color:#12121a;"
            + "font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;\">"
            + "Redefinir minha senha</a>"
            + "</td></tr>"
            + "<tr><td style=\"padding:0 32px 32px 32px;\">"
            + "<p style=\"color:#8a8a96;font-size:12px;line-height:1.6;margin:0;\">"
            + "Se você não solicitou essa alteração, pode ignorar este e-mail com segurança — sua senha atual continuará funcionando normalmente. "
            + "Se o botão não funcionar, copie e cole este link no navegador:<br>"
            + "<span style=\"color:#fa9848;word-break:break-all;\">" + link + "</span></p>"
            + "</td></tr>"
            + "</table>"
            + "</td></tr>"
            + "</table>"
            + "</body></html>";
    }

    private String escaparHtml(String valor) {
        return valor.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}

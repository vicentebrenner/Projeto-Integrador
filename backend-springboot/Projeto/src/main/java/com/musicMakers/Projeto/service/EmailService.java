package com.musicMakers.Projeto.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String nome, String email, String verificationCode) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

    helper.setFrom("\"Music Makers\" <postmaster@sandboxbca4fa8eb6054a9b95bbf2b904023d69.mailgun.org>");
        helper.setTo(email);
        helper.setSubject("Seu Código de Verificação");

        String htmlContent = "<p>Olá " + nome + ",</p>"
                + "<p>Seu código de verificação para o Music Makers é: <strong>" + verificationCode + "</strong></p>"
                + "<p>Este código expira em 15 minutos.</p>";
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
    
    public void sendResetPasswordEmail(String nome, String email, String resetLink) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

    helper.setFrom("\"Music Makers\" <postmaster@sandboxbca4fa8eb6054a9b95bbf2b904023d69.mailgun.org>");
        helper.setTo(email);
        helper.setSubject("Redefinição de Senha Solicitada");

        String htmlContent = "<p>Olá " + nome + ",</p>"
                + "<p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova:</p>"
                + "<p style='margin: 20px 0;'><a href=\"" + resetLink + "\" "
                + "style='background-color: #f39c12; color: #2c3e50; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 700;'>"
                + "Redefinir Senha Agora"
                + "</a></p>"
                + "<p>Se você não solicitou isso, ignore este e-mail.</p>"
                + "<p>Atenciosamente,<br>Equipe Music Makers</p>";
        
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}
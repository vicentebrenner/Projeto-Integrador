package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.PasswordResetToken;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.repository.PasswordResetTokenRepository;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final int EXPIRACAO_MINUTOS = 30;
    private static final String MENSAGEM_GENERICA =
        "Se o e-mail informado estiver cadastrado, você receberá um link de redefinição em instantes.";

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Sempre retorna a mesma mensagem genérica, exista ou não o e-mail, para não permitir
     * que alguém descubra quais e-mails estão cadastrados (enumeração de usuários).
     */
    @Transactional
    public String solicitarRecuperacao(String email) {
        if (email != null && !email.trim().isEmpty()) {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email.trim());
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                String tokenBruto = gerarTokenSeguro();

                PasswordResetToken resetToken = new PasswordResetToken();
                resetToken.setUsuario(usuario);
                resetToken.setTokenHash(hash(tokenBruto));
                resetToken.setDataExpiracao(LocalDateTime.now().plusMinutes(EXPIRACAO_MINUTOS));
                resetToken.setUsado(false);
                tokenRepository.save(resetToken);

                String link = frontendUrl + "/redefinir.html?token=" + tokenBruto;
                emailService.enviarEmailRedefinicaoSenha(usuario.getEmail(), usuario.getNome(), link);
            }
        }
        return MENSAGEM_GENERICA;
    }

    @Transactional
    public String redefinirSenha(String tokenBruto, String novaSenha) {
        if (tokenBruto == null || tokenBruto.trim().isEmpty()) {
            throw new IllegalArgumentException("Link de redefinição inválido ou ausente.");
        }
        if (novaSenha == null || novaSenha.trim().length() < 6) {
            throw new IllegalArgumentException("A nova senha deve ter pelo menos 6 caracteres.");
        }

        PasswordResetToken resetToken = tokenRepository.findByTokenHash(hash(tokenBruto.trim()))
            .orElseThrow(() -> new IllegalArgumentException("Link de redefinição inválido ou já utilizado."));

        if (Boolean.TRUE.equals(resetToken.getUsado())) {
            throw new IllegalArgumentException("Este link de redefinição já foi utilizado.");
        }
        if (resetToken.getDataExpiracao().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Este link de redefinição expirou. Solicite um novo.");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        resetToken.setUsado(true);
        tokenRepository.save(resetToken);

        return "Senha redefinida com sucesso!";
    }

    private String gerarTokenSeguro() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String valor) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(valor.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}

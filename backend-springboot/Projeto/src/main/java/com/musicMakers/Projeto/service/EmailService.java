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

        helper.setFrom("\"Music Makers\" <no-reply@musicmakers.com>");
        helper.setTo(email);
        helper.setSubject("Seu Código de Verificação");

        String htmlContent = "<p>Olá " + nome + ",</p>"
                + "<p>Seu código de verificação para o Music Makers é: <strong>" + verificationCode + "</strong></p>"
                + "<p>Este código expira em 15 minutos.</p>";
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}
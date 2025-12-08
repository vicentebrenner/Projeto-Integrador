package com.musicMakers.Projeto.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    // Removemos/Comentamos a dependência real de envio de e-mail
    // @Autowired
    // private JavaMailSender mailSender;

    public void sendVerificationEmail(String nome, String email, String verificationCode) {
        // Apenas imprime no console do Docker (Simulação)
        System.out.println("====== EMAIL SIMULADO (CADASTRO) ======");
        System.out.println("Para: " + email);
        System.out.println("Código: " + verificationCode);
        System.out.println("=======================================");
    }
    
    public void sendResetPasswordEmail(String nome, String email, String resetLink) {
        System.out.println("====== EMAIL SIMULADO (SENHA) ======");
        System.out.println("Para: " + email);
        System.out.println("Link: " + resetLink);
        System.out.println("====================================");
    }
}
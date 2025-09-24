package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import com.musicMakers.Projeto.service.EmailService;
import com.musicMakers.Projeto.service.TokenService; // 1. IMPORTAMOS O NOVO SERVIÇO
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Map; // 2. IMPORTAMOS A CLASSE MAP
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TokenService tokenService; // 3. INJETAMOS O TokenService

    @PostMapping("/register-request")
    public ResponseEntity<String> registerRequest(@RequestBody Usuario novoUsuario) {
        if (usuarioRepository.findByEmail(novoUsuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("E-mail já cadastrado.");
        }

        novoUsuario.setSenha(passwordEncoder.encode(novoUsuario.getSenha()));

        String verificationCode = String.format("%06d", new SecureRandom().nextInt(999999));
        novoUsuario.setVerificationCode(verificationCode);
        novoUsuario.setEnabled(false);

        usuarioRepository.save(novoUsuario);

        try {
            emailService.sendVerificationEmail(novoUsuario.getNome(), novoUsuario.getEmail(), verificationCode);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao enviar e-mail de verificação.");
        }

        return ResponseEntity.ok("Código de verificação enviado para o seu e-mail.");
    }

    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(@RequestParam String email, @RequestParam String code) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuário não encontrado.");
        }

        Usuario usuario = usuarioOpt.get();
        if (usuario.getVerificationCode() != null && usuario.getVerificationCode().equals(code)) {
            usuario.setEnabled(true);
            usuario.setVerificationCode(null);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok("Conta verificada com sucesso!");
        }

        return ResponseEntity.badRequest().body("Código de verificação inválido.");
    }

    // 4. MÉTODO DE LOGIN ATUALIZADO
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario loginRequest) { // Mudamos o tipo de retorno para ResponseEntity<?>
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(loginRequest.getEmail());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas.");
        }

        Usuario usuario = usuarioOpt.get();

        if (passwordEncoder.matches(loginRequest.getSenha(), usuario.getSenha())) {
            if (usuario.isEnabled()) {
                // SUCESSO! GERAMOS O TOKEN
                String token = tokenService.generateToken(usuario);

                // Retornamos um objeto JSON com o token e dados do usuário
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "usuario", Map.of("nome", usuario.getNome(), "email", usuario.getEmail())
                ));
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Conta não verificada.");
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas.");
    }
}

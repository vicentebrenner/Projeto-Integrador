package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import com.musicMakers.Projeto.service.EmailService;
import com.musicMakers.Projeto.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // @Autowired  // <-- PASSO 1: Comente a injeção de dependência.
    // private EmailService emailService;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/register-request")
    public ResponseEntity<String> registerRequest(@RequestBody Usuario novoUsuario) {
        if (usuarioRepository.findByEmail(novoUsuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("E-mail já cadastrado.");
        }

        novoUsuario.setSenha(passwordEncoder.encode(novoUsuario.getSenha()));
        
        novoUsuario.setEnabled(true); 

        usuarioRepository.save(novoUsuario);

        // O bloco de envio de e-mail já estava comentado, o que é perfeito.

        return ResponseEntity.ok("Cadastro realizado com sucesso!");
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario loginRequest) { 
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(loginRequest.getEmail());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas.");
        }

        Usuario usuario = usuarioOpt.get();

        if (passwordEncoder.matches(loginRequest.getSenha(), usuario.getSenha())) {
            if (usuario.isEnabled()) {
                String token = tokenService.generateToken(usuario);

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
    
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.ok("Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
        }

        Usuario usuario = usuarioOpt.get();
        
        String resetToken = tokenService.generateToken(usuario);

        usuario.setVerificationCode(resetToken);
        usuarioRepository.save(usuario);

        /* <-- PASSO 2: Comente o bloco que envia o e-mail.
        try {
            String resetLink = "http://localhost/redefinir.html?token=" + resetToken; 
            emailService.sendResetPasswordEmail(usuario.getNome(), usuario.getEmail(), resetLink);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao enviar e--mail de redefinição.");
        }
        */

        return ResponseEntity.ok("Link de redefinição enviado para o seu e-mail. Verifique a caixa de entrada.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String novaSenha = request.get("novaSenha");

        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body("Token de redefinição ausente.");
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByVerificationCode(token);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Token inválido ou expirado.");
        }

        Usuario usuario = usuarioOpt.get();
        
        if (!tokenService.validateToken(token, usuario.getEmail())) {
            return ResponseEntity.badRequest().body("Token expirado. Solicite uma nova redefinição.");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        
        usuario.setVerificationCode(null); 
        
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Senha redefinida com sucesso. Você já pode fazer login.");
    }
}
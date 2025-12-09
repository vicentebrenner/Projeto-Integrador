package com.musicMakers.Projeto.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import com.musicMakers.Projeto.service.TokenService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    // --- LOGIN (JÁ EXISTIA, MANTIDO IGUAL) ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String senha = body.get("senha");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (passwordEncoder.matches(senha, usuario.getSenha())) {
                String token = tokenService.generateToken(usuario);
                
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "id", usuario.getId(),
                    "nome", usuario.getNome(),
                    "role", usuario.getTipoUsuario()
                ));
            }
        }
        return ResponseEntity.status(401).body("Email ou senha inválidos");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Erro: Email já cadastrado.");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        if (usuario.getTipoUsuario() == null || usuario.getTipoUsuario().isEmpty()) {
            usuario.setTipoUsuario("MUSICO");
        }

        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("message", "Usuário cadastrado com sucesso!"));
    }
}
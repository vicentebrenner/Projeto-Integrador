package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import com.musicMakers.Projeto.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String senha = body.get("senha");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (passwordEncoder.matches(senha, usuario.getSenha())) {
                String token = tokenService.generateToken(usuario);
                // Retorna o token e o ID para o frontend usar
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
}
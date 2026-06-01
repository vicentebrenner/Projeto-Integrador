package com.musicMakers.Projeto.controller;

import java.util.Map;
import java.util.Optional;
import java.util.Collections;
import java.util.UUID;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
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

    // --- LOGIN ---
    @CrossOrigin(origins = "*")
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

        if (usuario.getTipoUsuario() == null || usuario.getTipoUsuario().trim().isEmpty()) {
            usuario.setTipoUsuario("MUSICO");
        } else {
            usuario.setTipoUsuario(usuario.getTipoUsuario().trim().toUpperCase());
        }

        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("message", "Usuário cadastrado com sucesso!"));
    }

    // --- LOGIN COM GOOGLE ---
    @CrossOrigin(origins = "*")
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String tokenString = body.get("credential");
        
        if (tokenString == null || tokenString.trim().isEmpty()) {
            return ResponseEntity.status(400).body("Token Google ausente. O Google bloqueou o envio do token.");
        }

        String clientId = "327030723105-jcbvbrnbfifl4huo24cd1upqva3h54k7.apps.googleusercontent.com"; // Seu Client ID

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();

            GoogleIdToken idToken = verifier.verify(tokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Verifica se usuário existe
                Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
                Usuario usuario;

                if (usuarioOpt.isPresent()) {
                    usuario = usuarioOpt.get(); // Faz o login
                } else {
                    // Cria uma nova conta
                    usuario = new Usuario();
                    usuario.setEmail(email);
                    usuario.setNome(name);
                    usuario.setSenha(passwordEncoder.encode(UUID.randomUUID().toString())); // Senha aleatória
                    usuario.setTipoUsuario("MUSICO"); // Padrão
                    usuario = usuarioRepository.save(usuario);
                }

                // Gera o nosso próprio token para o frontend
                String token = tokenService.generateToken(usuario);
                
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "id", usuario.getId(),
                    "nome", usuario.getNome(),
                    "role", usuario.getTipoUsuario()
                ));

            } else {
                return ResponseEntity.status(401).body("Token Google Inválido.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro interno na validação do Google.");
        }
    }
}
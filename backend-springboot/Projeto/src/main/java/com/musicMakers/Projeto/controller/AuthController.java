package com.musicMakers.Projeto.controller;

import java.util.HashMap;
import java.util.List;
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

import org.springframework.web.bind.annotation.GetMapping;
import com.musicMakers.Projeto.domain.entity.MembroBanda;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.repository.MembroBandaRepository;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import com.musicMakers.Projeto.repository.ConviteBandaRepository;
import com.musicMakers.Projeto.service.TokenService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MembroBandaRepository membroBandaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private ConviteBandaRepository conviteBandaRepository;

    // --- LOGIN ---
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

                // Busca o vínculo do usuário com sua banda (MembroBanda)
                List<MembroBanda> membros = membroBandaRepository.findByUsuarioId(usuario.getId());

                Map<String, Object> resposta = new HashMap<>();
                resposta.put("token", token);
                resposta.put("id", usuario.getId());
                resposta.put("nome", usuario.getNome());
                resposta.put("username", usuario.getUsername());
                resposta.put("corAvatar", usuario.getCorAvatar());
                resposta.put("role", usuario.getTipoUsuario());

                // Inclui membroId e bandaId para que o frontend possa buscar permissões
                if (!membros.isEmpty()) {
                    MembroBanda membro = membros.get(0); // considera o primeiro vínculo
                    resposta.put("membroId", membro.getId());
                    resposta.put("bandaId", membro.getBanda().getId());
                    resposta.put("gestor", Boolean.TRUE.equals(membro.getGestor()));
                } else {
                    resposta.put("membroId", null);
                    resposta.put("bandaId", null);
                    resposta.put("gestor", false);
                }

                return ResponseEntity.ok(resposta);
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
                    "username", usuario.getUsername(),
                    "corAvatar", usuario.getCorAvatar(),
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

    // --- GET ME STATUS ---
    @GetMapping("/me/status")
    public ResponseEntity<?> getMeStatus(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Não autenticado");
        }
        String email = principal.getName();
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Usuário não encontrado");
        }
        Usuario usuario = usuarioOpt.get();
        List<MembroBanda> membros = membroBandaRepository.findByUsuarioId(usuario.getId());

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("id", usuario.getId());
        resposta.put("nome", usuario.getNome());
        resposta.put("email", usuario.getEmail());
        resposta.put("username", usuario.getUsername());
        resposta.put("corAvatar", usuario.getCorAvatar());
        resposta.put("tipoUsuario", usuario.getTipoUsuario());

        if (!membros.isEmpty()) {
            MembroBanda membro = membros.get(0);
            resposta.put("membroId", membro.getId());
            resposta.put("bandaId", membro.getBanda().getId());
            resposta.put("gestor", Boolean.TRUE.equals(membro.getGestor()));
        } else {
            resposta.put("membroId", null);
            resposta.put("bandaId", null);
            resposta.put("gestor", false);
        }

        // Contagem de convites pendentes
        long convitesPendentes = conviteBandaRepository.findByUsuarioConvidadoIdAndStatus(usuario.getId(), "PENDENTE").size();
        resposta.put("convitesPendentes", convitesPendentes);

        return ResponseEntity.ok(resposta);
    }
}
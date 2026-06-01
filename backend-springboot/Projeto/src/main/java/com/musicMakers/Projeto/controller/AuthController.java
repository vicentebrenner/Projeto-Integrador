package com.musicMakers.Projeto.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
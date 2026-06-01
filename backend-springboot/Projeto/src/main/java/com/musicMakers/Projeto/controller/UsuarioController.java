package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @CrossOrigin(origins = "*")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluirConta(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String senhaFornecida = body.get("senha");
        
        if (senhaFornecida == null || senhaFornecida.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Senha é obrigatória para excluir a conta.");
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario usuario = usuarioOpt.get();

        if (!passwordEncoder.matches(senhaFornecida, usuario.getSenha())) {
            return ResponseEntity.status(401).body("Senha incorreta.");
        }

        try {
            usuarioRepository.delete(usuario);
            return ResponseEntity.ok("Conta excluída com sucesso.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao excluir a conta. Pode haver dependências (como bandas cadastradas) que impedem a exclusão.");
        }
    }
}

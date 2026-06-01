package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * GET /api/usuarios/buscar?nome=joao
     * Busca usuários do tipo MUSICO por nome, e-mail exato ou username com @.
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<Usuario>> buscarMusicosPorNome(@RequestParam(required = false) String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        String query = nome.trim();
        List<Usuario> resultado = new ArrayList<>();

        // Caso 1: Busca por E-mail exato (ex: joao@email.com)
        if (query.contains("@") && !query.startsWith("@")) {
            usuarioRepository.findByEmail(query).ifPresent(u -> {
                if ("MUSICO".equalsIgnoreCase(u.getTipoUsuario())) {
                    resultado.add(u);
                }
            });
        } 
        // Caso 2: Busca por Username/Handle com @ (ex: @joaosilva)
        else if (query.startsWith("@")) {
            String cleanName = query.substring(1);
            if (!cleanName.isEmpty()) {
                List<Usuario> musicos = usuarioRepository.findByNomeContainingIgnoreCaseAndTipoUsuario(cleanName, "MUSICO");
                resultado.addAll(musicos);
            }
        } 
        // Caso 3: Busca regular por nome ou e-mail exato
        else {
            List<Usuario> musicos = usuarioRepository.findByNomeContainingIgnoreCaseAndTipoUsuario(query, "MUSICO");
            resultado.addAll(musicos);
            
            usuarioRepository.findByEmail(query).ifPresent(u -> {
                if ("MUSICO".equalsIgnoreCase(u.getTipoUsuario()) && !resultado.contains(u)) {
                    resultado.add(u);
                }
            });
        }

        return ResponseEntity.ok(resultado);
    }
}

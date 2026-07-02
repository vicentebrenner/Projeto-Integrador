package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.dto.CandidaturaResponseDTO;
import com.musicMakers.Projeto.domain.entity.Candidatura;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.security.UsuarioAutenticadoProvider;
import com.musicMakers.Projeto.service.CandidaturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/candidaturas")
public class CandidaturaController {

    @Autowired
    private CandidaturaService candidaturaService;

    @Autowired
    private UsuarioAutenticadoProvider usuarioAutenticadoProvider;

    @PostMapping
    public ResponseEntity<CandidaturaResponseDTO> candidatar(@RequestBody Map<String, Object> body) {
        Long vagaId = Long.valueOf(body.get("vagaId").toString());
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        Candidatura candidatura = candidaturaService.candidatar(vagaId, usuarioAtual);
        return ResponseEntity.ok(CandidaturaResponseDTO.fromEntity(candidatura));
    }

    @GetMapping("/vaga/{vagaId}")
    public ResponseEntity<List<CandidaturaResponseDTO>> listarPorVaga(@PathVariable Long vagaId) {
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        List<CandidaturaResponseDTO> resultado = candidaturaService.listarPorVaga(vagaId, usuarioAtual).stream()
                .map(CandidaturaResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/minhas")
    public ResponseEntity<List<CandidaturaResponseDTO>> listarMinhas() {
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        List<CandidaturaResponseDTO> resultado = candidaturaService.listarMinhas(usuarioAtual).stream()
                .map(CandidaturaResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(resultado);
    }

    @PutMapping("/{id}/aprovar")
    public ResponseEntity<CandidaturaResponseDTO> aprovar(@PathVariable Long id) {
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        Candidatura candidatura = candidaturaService.atualizarStatus(id, "APROVADO", usuarioAtual);
        return ResponseEntity.ok(CandidaturaResponseDTO.fromEntity(candidatura));
    }

    @PutMapping("/{id}/rejeitar")
    public ResponseEntity<CandidaturaResponseDTO> rejeitar(@PathVariable Long id) {
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        Candidatura candidatura = candidaturaService.atualizarStatus(id, "REJEITADO", usuarioAtual);
        return ResponseEntity.ok(CandidaturaResponseDTO.fromEntity(candidatura));
    }
}

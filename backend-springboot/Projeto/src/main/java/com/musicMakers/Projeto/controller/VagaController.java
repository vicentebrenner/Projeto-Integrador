package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.Vaga;
import com.musicMakers.Projeto.service.VagaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.musicMakers.Projeto.domain.dto.CandidatoCompativelDTO;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vagas")
public class VagaController {

    @Autowired
    private VagaService vagaService;

    @GetMapping
    public List<Vaga> listarAbertas() {
        return vagaService.listarAbertas();
    }

    @PostMapping("/banda/{bandaId}")
    public ResponseEntity<Vaga> criarVaga(@PathVariable Long bandaId, @RequestBody Vaga vaga) {
        return ResponseEntity.ok(vagaService.criarVaga(bandaId, vaga));
    }
    
    @GetMapping("/banda/{bandaId}")
    public ResponseEntity<List<Vaga>> listarPorBanda(@PathVariable Long bandaId) {
        return ResponseEntity.ok(vagaService.listarPorBanda(bandaId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Vaga> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(vagaService.buscarPorId(id));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Vaga> atualizarVaga(@PathVariable Long id, @RequestBody Vaga vaga) {
        return ResponseEntity.ok(vagaService.atualizarVaga(id, vaga));
    }
    
    @GetMapping("/{id}/candidatos-compativeis")
    public ResponseEntity<List<CandidatoCompativelDTO>> buscarCandidatosCompativeis(@PathVariable Long id) {
        return ResponseEntity.ok(vagaService.buscarCandidatosCompativeis(id));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarVaga(@PathVariable Long id) {
        vagaService.deletarVaga(id);
        return ResponseEntity.noContent().build();
    }
}
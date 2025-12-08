package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.Vaga;
import com.musicMakers.Projeto.service.VagaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
}
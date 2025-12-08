package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.Banda;
import com.musicMakers.Projeto.service.BandaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bandas")
public class BandaController {

    @Autowired
    private BandaService bandaService;

    @GetMapping
    public List<Banda> listarTodas() {
        return bandaService.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banda> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bandaService.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Banda> criarBanda(@RequestBody Banda banda, @RequestParam Long idUsuario) {
        // Exemplo: POST /api/bandas?idUsuario=1
        return ResponseEntity.ok(bandaService.criarBanda(banda, idUsuario));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarBanda(@PathVariable Long id) {
        bandaService.deletarBanda(id);
        return ResponseEntity.noContent().build();
    }
}
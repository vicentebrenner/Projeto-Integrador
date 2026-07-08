package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.dto.MusicaUpdateDTO;
import com.musicMakers.Projeto.domain.entity.Musica;
import com.musicMakers.Projeto.service.MusicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/musicas")
public class MusicaController {

    @Autowired
    private MusicaService musicaService;

    @GetMapping("/banda/{bandaId}")
    public List<Musica> listarPorBanda(@PathVariable Long bandaId) {
        return musicaService.listarPorBanda(bandaId);
    }

    @PostMapping("/banda/{bandaId}")
    public ResponseEntity<Musica> adicionarMusica(@PathVariable Long bandaId, @RequestBody Musica musica) {
        return ResponseEntity.ok(musicaService.adicionarMusica(bandaId, musica));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Musica> atualizarMusica(@PathVariable Long id, @RequestBody MusicaUpdateDTO dto) {
        return ResponseEntity.ok(musicaService.atualizarMusica(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarMusica(@PathVariable Long id) {
        musicaService.deletarMusica(id);
        return ResponseEntity.noContent().build();
    }
}

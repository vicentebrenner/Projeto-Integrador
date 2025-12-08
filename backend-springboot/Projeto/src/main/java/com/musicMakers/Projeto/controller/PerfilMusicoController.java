package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.PerfilMusico;
import com.musicMakers.Projeto.service.PerfilMusicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/musicos")
public class PerfilMusicoController {

    @Autowired
    private PerfilMusicoService perfilMusicoService;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilMusico> buscarPorUsuario(@PathVariable Long usuarioId) {
        PerfilMusico perfil = perfilMusicoService.buscarPorUsuarioId(usuarioId);
        if (perfil != null) {
            return ResponseEntity.ok(perfil);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilMusico> salvarPerfil(@PathVariable Long usuarioId, @RequestBody PerfilMusico perfil) {
        return ResponseEntity.ok(perfilMusicoService.salvarPerfil(usuarioId, perfil));
    }
}
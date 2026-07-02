package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.PerfilGestor;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.domain.dto.PerfilGestorUpdateDTO;
import com.musicMakers.Projeto.domain.dto.PerfilGestorCompletoResponseDTO;
import com.musicMakers.Projeto.security.AutorizacaoService;
import com.musicMakers.Projeto.security.UsuarioAutenticadoProvider;
import com.musicMakers.Projeto.service.PerfilGestorService;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gestores")
public class PerfilGestorController {

    @Autowired
    private PerfilGestorService perfilGestorService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioAutenticadoProvider usuarioAutenticadoProvider;

    @Autowired
    private AutorizacaoService autorizacaoService;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilGestorCompletoResponseDTO> buscarPorUsuario(@PathVariable Long usuarioId) {
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirDonoRecurso(usuarioId, usuarioAtual);

        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }

        PerfilGestor perfil = perfilGestorService.buscarPorUsuarioId(usuarioId);
        PerfilGestorCompletoResponseDTO response = PerfilGestorCompletoResponseDTO.fromEntities(usuario, perfil);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/usuario/{usuarioId}/completo")
    public ResponseEntity<PerfilGestor> salvarPerfilCompleto(@PathVariable Long usuarioId, @RequestBody PerfilGestorUpdateDTO dto) {
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirDonoRecurso(usuarioId, usuarioAtual);

        return ResponseEntity.ok(perfilGestorService.salvarPerfilCompleto(usuarioId, dto));
    }
}

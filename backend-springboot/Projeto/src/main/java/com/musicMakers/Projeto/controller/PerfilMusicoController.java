package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.PerfilMusico;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.domain.dto.PerfilUpdateDTO;
import com.musicMakers.Projeto.domain.dto.PerfilCompletoResponseDTO;
import com.musicMakers.Projeto.security.AutorizacaoService;
import com.musicMakers.Projeto.security.UsuarioAutenticadoProvider;
import com.musicMakers.Projeto.service.PerfilMusicoService;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/musicos")
public class PerfilMusicoController {

    @Autowired
    private PerfilMusicoService perfilMusicoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioAutenticadoProvider usuarioAutenticadoProvider;

    @Autowired
    private AutorizacaoService autorizacaoService;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilCompletoResponseDTO> buscarPorUsuario(@PathVariable Long usuarioId) {
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirDonoRecurso(usuarioId, usuarioAtual);

        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }

        PerfilMusico perfil = perfilMusicoService.buscarPorUsuarioId(usuarioId);
        PerfilCompletoResponseDTO response = PerfilCompletoResponseDTO.fromEntities(usuario, perfil);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/usuario/{usuarioId}/completo")
    public ResponseEntity<PerfilMusico> salvarPerfilCompleto(@PathVariable Long usuarioId, @RequestBody PerfilUpdateDTO dto) {
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirDonoRecurso(usuarioId, usuarioAtual);

        return ResponseEntity.ok(perfilMusicoService.salvarPerfilCompleto(usuarioId, dto));
    }
}

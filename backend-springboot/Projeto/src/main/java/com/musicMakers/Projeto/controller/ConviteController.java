package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.ConviteBanda;
import com.musicMakers.Projeto.domain.entity.MembroBanda;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.security.UsuarioAutenticadoProvider;
import com.musicMakers.Projeto.service.ConviteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/convites")
public class ConviteController {

    @Autowired
    private ConviteService conviteService;

    @Autowired
    private UsuarioAutenticadoProvider usuarioAutenticadoProvider;

    /**
     * POST /api/convites
     * Body: { "bandaId": 1, "usuarioConvidadoId": 3 }
     */
    @PostMapping
    public ResponseEntity<?> enviarConvite(@RequestBody Map<String, Object> body) {
        try {
            Long bandaId = Long.valueOf(body.get("bandaId").toString());
            Long usuarioConvidadoId = Long.valueOf(body.get("usuarioConvidadoId").toString());

            Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
            ConviteBanda convite = conviteService.enviarConvite(bandaId, usuarioAtual, usuarioConvidadoId);
            return ResponseEntity.ok(convite);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/convites/pendentes
     */
    @GetMapping("/pendentes")
    public ResponseEntity<?> listarPendentes() {
        try {
            Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
            List<ConviteBanda> pendentes = conviteService.listarPendentes(usuarioAtual.getId());
            return ResponseEntity.ok(pendentes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/convites/enviados/{bandaId}
     */
    @GetMapping("/enviados/{bandaId}")
    public ResponseEntity<?> listarEnviados(@PathVariable Long bandaId) {
        try {
            List<ConviteBanda> enviados = conviteService.listarEnviados(bandaId);
            return ResponseEntity.ok(enviados);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/convites/{id}/aceitar
     */
    @PutMapping("/{id}/aceitar")
    public ResponseEntity<?> aceitarConvite(@PathVariable Long id) {
        try {
            Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
            MembroBanda membro = conviteService.aceitarConvite(id, usuarioAtual.getId());
            return ResponseEntity.ok(Map.of(
                "message", "Convite aceito com sucesso!",
                "membroId", membro.getId(),
                "bandaId", membro.getBanda().getId(),
                "gestor", Boolean.TRUE.equals(membro.getGestor())
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/convites/{id}/recusar
     */
    @PutMapping("/{id}/recusar")
    public ResponseEntity<?> recusarConvite(@PathVariable Long id) {
        try {
            Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
            conviteService.recusarConvite(id, usuarioAtual.getId());
            return ResponseEntity.ok(Map.of("message", "Convite recusado com sucesso!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/convites/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelarConvite(@PathVariable Long id) {
        try {
            conviteService.cancelarConvite(id);
            return ResponseEntity.ok(Map.of("message", "Convite cancelado com sucesso!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

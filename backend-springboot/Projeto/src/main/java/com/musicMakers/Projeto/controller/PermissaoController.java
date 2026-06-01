package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.service.PermissaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/permissoes")
public class PermissaoController {

    @Autowired
    private PermissaoService permissaoService;

    /**
     * GET /api/permissoes/membro/{membroId}
     * Retorna as permissões de um membro específico.
     * Resposta: { "agenda": true, "financeiro": false, "membros": true, "repertorio": true }
     */
    @GetMapping("/membro/{membroId}")
    public ResponseEntity<Map<String, Boolean>> buscarPermissoesMembro(@PathVariable Long membroId) {
        try {
            Map<String, Boolean> permissoes = permissaoService.buscarPermissoes(membroId);
            return ResponseEntity.ok(permissoes);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT /api/permissoes/membro/{membroId}
     * Atualiza as permissões de um membro (apenas GESTOR deve chamar).
     * Body: { "agenda": true, "financeiro": false, "membros": true, "repertorio": false }
     */
    @PutMapping("/membro/{membroId}")
    public ResponseEntity<Map<String, Boolean>> salvarPermissoesMembro(
            @PathVariable Long membroId,
            @RequestBody Map<String, Boolean> permissoes) {
        try {
            Map<String, Boolean> resultado = permissaoService.salvarPermissoes(membroId, permissoes);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/permissoes/banda/{bandaId}
     * Lista todos os membros não-gestores da banda com suas permissões.
     * Usado pela aba de Configurações do GESTOR.
     */
    @GetMapping("/banda/{bandaId}")
    public ResponseEntity<List<Map<String, Object>>> buscarPermissoesBanda(@PathVariable Long bandaId) {
        List<Map<String, Object>> resultado = permissaoService.buscarPermissoesDaBanda(bandaId);
        return ResponseEntity.ok(resultado);
    }
}

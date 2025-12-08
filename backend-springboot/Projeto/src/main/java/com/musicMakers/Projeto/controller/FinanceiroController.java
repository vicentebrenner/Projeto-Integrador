package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.Financeiro;
import com.musicMakers.Projeto.service.FinanceiroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/financeiro")
public class FinanceiroController {

    @Autowired
    private FinanceiroService financeiroService;

    @GetMapping("/banda/{bandaId}")
    public List<Financeiro> listarPorBanda(@PathVariable Long bandaId) {
        return financeiroService.listarTransacoes(bandaId);
    }

    @PostMapping("/banda/{bandaId}")
    public ResponseEntity<Financeiro> adicionarTransacao(@PathVariable Long bandaId, @RequestBody Financeiro financeiro) {
        return ResponseEntity.ok(financeiroService.adicionarTransacao(bandaId, financeiro));
    }
}
package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.handler.ServiceHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private ServiceHandler serviceHandler;

    @PostMapping("/comando")
    public ResponseEntity<Map<String, String>> processarComando(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        if (prompt == null || prompt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "O prompt não pode ser vazio."));
        }
        
        // O Controller não conhece o serviço de IA, ele apenas conversa com o Handler.
        String resposta = serviceHandler.anotarPedido(prompt);
        
        return ResponseEntity.ok(Map.of("resposta", resposta));
    }
}
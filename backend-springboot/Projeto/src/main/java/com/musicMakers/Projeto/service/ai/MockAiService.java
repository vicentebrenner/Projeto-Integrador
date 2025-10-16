package com.musicMakers.Projeto.service.ai;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Implementação Mock da interface AiService.
 * Esta classe simula o comportamento de uma IA, retornando respostas pré-definidas
 * com base no prompt recebido.
 */
@Service // A anotação @Service torna esta classe um bean gerenciado pelo Spring
public class MockAiService implements AiService {

    private final Map<String, String> respostasMock = new HashMap<>();

    public MockAiService() {
        // Populando nossas respostas pré-definidas
        respostasMock.put("bom dia", "Olá! Bom dia. Como posso ajudar sua banda hoje?");
        respostasMock.put("ideias de nome para banda de rock", "Claro! Que tal 'Riff a Rato', 'Os Amplificadores' ou 'Distorção Urbana'?");
        respostasMock.put("sugestão de repertório", "Para um show de rock, sugiro clássicos como 'Smells Like Teen Spirit' e 'Back in Black'.");
    }

    @Override
    public String obterResposta(String prompt) {
        // Converte o prompt para minúsculas para uma correspondência mais flexível
        String promptFormatado = prompt.toLowerCase().trim();
        
        // Retorna a resposta mock correspondente ou uma resposta padrão
        return respostasMock.getOrDefault(promptFormatado, "Desculpe, não entendi o seu pedido. Pode tentar de outra forma?");
    }
}
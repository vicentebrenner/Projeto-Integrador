package com.musicMakers.Projeto.handler;

import com.musicMakers.Projeto.service.ai.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Handler (orquestrador) de serviços.
 * Ele atua como um "garçom", recebendo solicitações e encaminhando-as
 * para os serviços apropriados da "cozinha".
 */
@Component // @Component é uma anotação genérica para qualquer bean gerenciado pelo Spring
public class ServiceHandler {

    private final AiService aiService;

    /**
     * O Spring injetará automaticamente a implementação disponível de AiService
     * (neste caso, nosso MockAiService).
     * @param aiService A implementação do serviço de IA.
     */
    @Autowired
    public ServiceHandler(AiService aiService) {
        this.aiService = aiService;
    }

    /**
     * Método principal que anota e delega o serviço.
     * @param prompt O comando ou pergunta do usuário.
     * @return A resposta processada pelo serviço correspondente.
     */
    public String anotarPedido(String prompt) {
        // Por enquanto, ele apenas delega para o serviço de IA.
        // No futuro, ele poderia ter uma lógica mais complexa para chamar outros serviços.
        // Ex: if (prompt.contains("agendar ensaio")) { ... }
        System.out.println("Handler recebeu o pedido: '" + prompt + "'. Enviando para a cozinha (AiService)...");
        return aiService.obterResposta(prompt);
    }
}
package com.musicMakers.Projeto.service.ai;

/**
 * Interface que define o contrato para serviços de Inteligência Artificial.
 * Qualquer classe que processe comandos ou gere conteúdo de IA deve implementar esta interface.
 */
public interface AiService {

    /**
     * Processa uma solicitação de texto e retorna uma resposta gerada.
     *
     * @param prompt O texto de entrada a ser processado pela IA.
     * @return Uma String contendo a resposta da IA.
     */
    String obterResposta(String prompt);
}
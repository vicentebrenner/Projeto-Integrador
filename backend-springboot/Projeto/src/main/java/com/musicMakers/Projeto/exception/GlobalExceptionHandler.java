package com.musicMakers.Projeto.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.hibernate.exception.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<Map<String, String>> handleAcessoNegadoException(AcessoNegadoException ex, WebRequest request) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Acesso Negado");
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex, WebRequest request) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Erro de Processamento");
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(DataIntegrityViolationException ex, WebRequest request) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Erro de Integridade de Dados");
        response.put("message", "Erro ao salvar os dados. Verifique a integridade dos relacionamentos ou se as chaves estrangeiras são válidas.");
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraintViolationException(ConstraintViolationException ex, WebRequest request) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Erro de Validação");
        response.put("message", "Campos obrigatórios não preenchidos ou com formato inválido.");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGlobalException(Exception ex, WebRequest request) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Erro Interno do Servidor");
        response.put("message", "Ocorreu uma falha interna no servidor. Por favor, verifique os dados e tente novamente.");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

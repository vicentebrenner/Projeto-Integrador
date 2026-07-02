package com.musicMakers.Projeto.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class VagaRequestDTO {
    private String titulo;
    private String instrumentoNecessario;
    private String descricao;
    private String status;
    private Integer quantidadeVagas;
    private String responsabilidades;
    private String requisitosObrigatorios;
    private String requisitosDesejaveis;
    private String nivelExperiencia;
    private String dataLimite;
    private String pais;
    private String estado;
    private String regiao;
    private String cidade;
    private String bairro;
    private String funcao;
}

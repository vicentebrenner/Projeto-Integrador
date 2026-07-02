package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "vaga")
public class Vaga {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "banda_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Banda banda;

    private String titulo;
    
    @Column(name = "instrumento_necessario")
    private String instrumentoNecessario;
    
    private String descricao;
    private String status; // ABERTA, EM_ANDAMENTO, ENCERRADA
    
    @Column(name = "quantidade_vagas")
    private Integer quantidadeVagas = 1;
    
    @Column(columnDefinition = "TEXT")
    private String responsabilidades;
    
    @Column(name = "requisitos_obrigatorios", columnDefinition = "TEXT")
    private String requisitosObrigatorios;
    
    @Column(name = "requisitos_desejaveis", columnDefinition = "TEXT")
    private String requisitosDesejaveis;
    
    @Column(name = "nivel_experiencia")
    private String nivelExperiencia;
    
    @Column(name = "data_limite")
    private String dataLimite;
    
    private String pais;
    private String estado;
    private String regiao;
    private String cidade;
    private String bairro;
    private String funcao;

    public String getBandaNome() {
        return banda != null ? banda.getNome() : null;
    }

    public Long getBandaId() {
        return banda != null ? banda.getId() : null;
    }
}
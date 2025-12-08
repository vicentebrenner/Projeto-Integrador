package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "financeiro")
public class Financeiro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "banda_id")
    private Banda banda;

    private String tipo; // RECEITA, DESPESA
    private String descricao;
    private BigDecimal valor;
    
    @Column(name = "data_transacao")
    private LocalDate dataTransacao;
    
    private String categoria;
}
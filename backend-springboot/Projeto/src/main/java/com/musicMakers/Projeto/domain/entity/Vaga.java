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
    private Banda banda;

    private String titulo;
    
    @Column(name = "instrumento_necessario")
    private String instrumentoNecessario;
    
    private String descricao;
    private String status; // ABERTA, FECHADA
}
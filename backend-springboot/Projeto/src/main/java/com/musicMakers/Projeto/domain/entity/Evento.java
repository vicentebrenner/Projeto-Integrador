package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "evento")
public class Evento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "banda_id")
    private Banda banda;

    private String tipo;
    
    @Column(name = "data_hora")
    private LocalDateTime dataHora;
    
    private String local;
    private String descricao;
}
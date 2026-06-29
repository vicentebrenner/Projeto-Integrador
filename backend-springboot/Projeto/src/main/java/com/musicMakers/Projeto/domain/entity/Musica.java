package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "musica")
public class Musica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "banda_id", nullable = false)
    private Banda banda;

    @Column(nullable = false)
    private String nome;

    private String origem; // Ex: autoral, cover, etc.

    @Column(name = "partitura_url", columnDefinition = "TEXT")
    private String partituraUrl;
}

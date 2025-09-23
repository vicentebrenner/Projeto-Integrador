package com.musicMakers.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "avaliacoes")
@Data
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_curso")
    private Curso curso;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    private int nota;
    private String comentarios;

    @Column(name = "data_avaliacoes")
    private LocalDate dataAvaliacao;
}
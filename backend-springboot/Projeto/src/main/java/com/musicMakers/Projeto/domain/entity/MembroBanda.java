package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@Table(name = "membro_banda")
public class MembroBanda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "banda_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Banda banda;

    private String funcao; // Ex: Guitarrista
    private Boolean gestor;
}
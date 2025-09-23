package com.musicMakers.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "professores")
@Data
public class Professor {

    @Id
    private Integer id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Usuario usuario;

    private String biografia;
    private String especialidade;

    @Column(name = "foto_perfil")
    private String fotoPerfil;

    @OneToMany(mappedBy = "professor")
    private List<Curso> cursos;
}
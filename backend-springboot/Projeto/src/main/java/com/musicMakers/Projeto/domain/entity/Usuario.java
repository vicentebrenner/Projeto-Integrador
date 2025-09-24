package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "usuario")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 100)
    private String nome;

    @Column(length = 100)
    private String email;

    private String senha;

    @Column(name = "tipo_usuario", length = 50)
    private String tipoUsuario;

    @Column(name = "data_criacao")
    private LocalDate dataCriacao;

    @OneToMany(mappedBy = "usuario")
    private List<Venda> vendas;

    @OneToMany(mappedBy = "usuario")
    private List<Avaliacao> avaliacoes;

    @OneToMany(mappedBy = "usuario")
    private List<Inscricao> inscricoes;
}
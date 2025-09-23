package com.musicMakers.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "cursos")
@Data
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String titulo;
    private String descricao;
    private BigDecimal preco;
    private boolean publicado;

    @Column(name = "imagem_capa")
    private String imagemCapa;

    @ManyToOne
    @JoinColumn(name = "id_professor")
    private Professor professor;

    @ManyToOne
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @OneToMany(mappedBy = "curso")
    private List<Aula> aulas;

    @OneToMany(mappedBy = "curso")
    private List<Avaliacao> avaliacoes;

    @OneToMany(mappedBy = "curso")
    private List<Inscricao> inscricoes;

    @OneToMany(mappedBy = "curso")
    private List<ItemVenda> itensVenda;
}
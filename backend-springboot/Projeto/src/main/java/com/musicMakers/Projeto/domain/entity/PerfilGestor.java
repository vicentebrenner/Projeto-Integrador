package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@Table(name = "perfil_gestor")
public class PerfilGestor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;

    private String whatsapp;
    private String estado;
    private String cidade;

    @Column(name = "nome_produtora")
    private String nomeProdutora;

    @Column(name = "tempo_experiencia_gestao")
    private String tempoExperienciaGestao;

    @Column(name = "generos_musicais")
    private String generosMusicais;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "links_profissionais", columnDefinition = "TEXT")
    private String linksProfissionais;
}

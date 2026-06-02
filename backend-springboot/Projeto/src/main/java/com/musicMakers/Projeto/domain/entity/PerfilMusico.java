package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@Table(name = "perfil_musico")
public class PerfilMusico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id")
    private Usuario usuario;

    @Column(name = "instrumentos_principais")
    private String instrumentosPrincipais;

    private String biografia;
    
    private String localizacao;
    
    @Column(name = "link_videos")
    private String linkVideos;

    @Column(name = "nivel_habilidade")
    private String nivelHabilidade;

    @Column(name = "tempo_experiencia")
    private String tempoExperiencia;

    @Column(name = "generos_musicais")
    private String generosMusicais;

    private String influencias;

    @Column(name = "status_busca")
    private String statusBusca;

    private String disponibilidade;

    private String equipamento;

    @Column(name = "redes_sociais")
    private String redesSociais;
}
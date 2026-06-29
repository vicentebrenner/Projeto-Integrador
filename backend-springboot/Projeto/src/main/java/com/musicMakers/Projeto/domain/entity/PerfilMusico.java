package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import lombok.EqualsAndHashCode;
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
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;

    @Column(name = "instrumentos_principais", columnDefinition = "TEXT")
    private String instrumentosPrincipais;

    @Column(columnDefinition = "TEXT")
    private String biografia;
    
    private String localizacao;
    
    private String pais;
    private String estado;
    private String regiao;
    private String cidade;
    private String bairro;
    private String funcao;
    
    @Column(name = "ministerios_interesse", columnDefinition = "TEXT")
    private String ministeriosInteresse;
    
    @Column(name = "formacao_musical", columnDefinition = "TEXT")
    private String formacaoMusical;
    
    @Column(name = "link_videos", columnDefinition = "TEXT")
    private String linkVideos;

    @Column(name = "nivel_habilidade")
    private String nivelHabilidade;

    @Column(name = "tempo_experiencia")
    private String tempoExperiencia;

    @Column(name = "generos_musicais")
    private String generosMusicais;

    @Column(columnDefinition = "TEXT")
    private String influencias;

    @Column(name = "status_busca")
    private String statusBusca;

    private String disponibilidade;

    private String equipamento;

    @Column(name = "redes_sociais")
    private String redesSociais;

    private String whatsapp;

    @Column(name = "data_nascimento")
    private String dataNascimento;
}
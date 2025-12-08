package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "perfil_musico")
public class PerfilMusico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id")
    private Usuario usuario;

    @Column(name = "instrumentos_principais")
    private String instrumentosPrincipais;

    private String biografia;
    
    @Column(name = "link_videos")
    private String linkVideos;
}
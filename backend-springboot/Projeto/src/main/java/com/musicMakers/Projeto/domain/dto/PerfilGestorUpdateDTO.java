package com.musicMakers.Projeto.domain.dto;

import lombok.Data;

@Data
public class PerfilGestorUpdateDTO {
    private String nome;
    private String corAvatar;

    private String whatsapp;
    private String estado;
    private String cidade;
    private String nomeProdutora;
    private String tempoExperienciaGestao;
    private String generosMusicais;
    private String bio;
    private String linksProfissionais;
}

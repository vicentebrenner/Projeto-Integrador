package com.musicMakers.Projeto.domain.dto;

import lombok.Data;

@Data
public class PerfilUpdateDTO {
    private String nome;
    private String whatsapp;
    private String dataNascimento;
    
    private String corAvatar;
    private String localizacao;
    private String instrumentosPrincipais;
    private String biografia;
    private String linkVideos;
    
    // Novos campos
    private String nivelHabilidade;
    private String tempoExperiencia;
    private String generosMusicais;
    private String influencias;
    private String statusBusca;
    private String disponibilidade;
    private String equipamento;
    private String redesSociais;
}

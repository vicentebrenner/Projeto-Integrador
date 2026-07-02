package com.musicMakers.Projeto.domain.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BandaUpdateDTO {
    private String nome;
    private String generoMusical;
    private String descricao;
    private LocalDate dataFormacao;
}

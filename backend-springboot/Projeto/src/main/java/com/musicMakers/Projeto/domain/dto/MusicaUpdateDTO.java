package com.musicMakers.Projeto.domain.dto;

import lombok.Data;

@Data
public class MusicaUpdateDTO {
    private String nome;
    private String origem;
    private String status;
    private String partituraUrl;
}

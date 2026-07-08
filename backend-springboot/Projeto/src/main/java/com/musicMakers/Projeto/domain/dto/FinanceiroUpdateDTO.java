package com.musicMakers.Projeto.domain.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FinanceiroUpdateDTO {
    private String tipo;
    private String descricao;
    private BigDecimal valor;
    private LocalDate dataTransacao;
    private String categoria;
    private String status;
}

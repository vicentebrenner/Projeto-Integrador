package com.musicMakers.Projeto.domain.dto;

import com.musicMakers.Projeto.domain.entity.PerfilMusico;
import lombok.Data;

@Data
public class CandidatoCompativelDTO {
    private PerfilMusico perfilMusico;
    private int percentualCompatibilidade;
    private String statusCandidatura; // "NAO_CANDIDATADO", "PENDENTE", "APROVADO", "RECUSADO"
    
    public CandidatoCompativelDTO(PerfilMusico perfilMusico, int percentualCompatibilidade, String statusCandidatura) {
        this.perfilMusico = perfilMusico;
        this.percentualCompatibilidade = percentualCompatibilidade;
        this.statusCandidatura = statusCandidatura;
    }
}

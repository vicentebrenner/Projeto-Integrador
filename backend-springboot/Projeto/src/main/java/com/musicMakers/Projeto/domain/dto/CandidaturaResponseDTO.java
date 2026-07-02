package com.musicMakers.Projeto.domain.dto;

import com.musicMakers.Projeto.domain.entity.Candidatura;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CandidaturaResponseDTO {
    private Long id;
    private Long vagaId;
    private String vagaTitulo;
    private Long perfilMusicoId;
    private Long usuarioId;
    private String nomeMusico;
    private String instrumentosPrincipais;
    private String cidade;
    private String estado;
    private LocalDateTime dataCandidatura;
    private String status;

    public static CandidaturaResponseDTO fromEntity(Candidatura c) {
        CandidaturaResponseDTO dto = new CandidaturaResponseDTO();
        dto.setId(c.getId());

        if (c.getVaga() != null) {
            dto.setVagaId(c.getVaga().getId());
            dto.setVagaTitulo(c.getVaga().getTitulo());
        }

        if (c.getPerfilMusico() != null) {
            dto.setPerfilMusicoId(c.getPerfilMusico().getId());
            dto.setInstrumentosPrincipais(c.getPerfilMusico().getInstrumentosPrincipais());
            dto.setCidade(c.getPerfilMusico().getCidade());
            dto.setEstado(c.getPerfilMusico().getEstado());

            if (c.getPerfilMusico().getUsuario() != null) {
                dto.setUsuarioId(c.getPerfilMusico().getUsuario().getId());
                dto.setNomeMusico(c.getPerfilMusico().getUsuario().getNome());
            }
        }

        dto.setDataCandidatura(c.getDataCandidatura());
        dto.setStatus(c.getStatus());

        return dto;
    }
}

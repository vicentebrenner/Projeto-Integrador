package com.musicMakers.Projeto.domain.dto;

import com.musicMakers.Projeto.domain.entity.PerfilMusico;
import com.musicMakers.Projeto.domain.entity.Usuario;
import lombok.Data;

/**
 * DTO que combina dados do Usuario e do PerfilMusico
 * para retornar ao frontend sem problemas de @JsonIgnore.
 */
@Data
public class PerfilCompletoResponseDTO {

    // Dados do Usuário
    private Long usuarioId;
    private String nome;
    private String username;
    private String email;
    private String corAvatar;

    // Dados do Perfil Músico
    private String localizacao;
    private String pais;
    private String estado;
    private String regiao;
    private String cidade;
    private String bairro;
    private String funcao;
    private String ministeriosInteresse;
    private String formacaoMusical;
    private String instrumentosPrincipais;
    private String nivelHabilidade;
    private String tempoExperiencia;
    private String generosMusicais;
    private String influencias;
    private String statusBusca;
    private String disponibilidade;
    private String equipamento;
    private String redesSociais;
    private String biografia;
    private String linkVideos;
    private String whatsapp;
    private String dataNascimento;

    public static PerfilCompletoResponseDTO fromEntities(Usuario usuario, PerfilMusico perfil) {
        PerfilCompletoResponseDTO dto = new PerfilCompletoResponseDTO();
        
        // Dados do usuário
        dto.setUsuarioId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setUsername(usuario.getUsername());
        dto.setEmail(usuario.getEmail());
        dto.setCorAvatar(usuario.getCorAvatar());

        // Dados do perfil
        if (perfil != null) {
            dto.setLocalizacao(perfil.getLocalizacao());
            dto.setPais(perfil.getPais());
            dto.setEstado(perfil.getEstado());
            dto.setRegiao(perfil.getRegiao());
            dto.setCidade(perfil.getCidade());
            dto.setBairro(perfil.getBairro());
            dto.setFuncao(perfil.getFuncao());
            dto.setMinisteriosInteresse(perfil.getMinisteriosInteresse());
            dto.setFormacaoMusical(perfil.getFormacaoMusical());
            dto.setInstrumentosPrincipais(perfil.getInstrumentosPrincipais());
            dto.setNivelHabilidade(perfil.getNivelHabilidade());
            dto.setTempoExperiencia(perfil.getTempoExperiencia());
            dto.setGenerosMusicais(perfil.getGenerosMusicais());
            dto.setInfluencias(perfil.getInfluencias());
            dto.setStatusBusca(perfil.getStatusBusca());
            dto.setDisponibilidade(perfil.getDisponibilidade());
            dto.setEquipamento(perfil.getEquipamento());
            dto.setRedesSociais(perfil.getRedesSociais());
            dto.setBiografia(perfil.getBiografia());
            dto.setLinkVideos(perfil.getLinkVideos());
            dto.setWhatsapp(perfil.getWhatsapp());
            dto.setDataNascimento(perfil.getDataNascimento());
        }

        return dto;
    }
}

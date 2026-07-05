package com.musicMakers.Projeto.domain.dto;

import com.musicMakers.Projeto.domain.entity.PerfilGestor;
import com.musicMakers.Projeto.domain.entity.Usuario;
import lombok.Data;

/**
 * DTO que combina dados do Usuario e do PerfilGestor
 * para retornar ao frontend sem problemas de @JsonIgnore.
 */
@Data
public class PerfilGestorCompletoResponseDTO {

    // Dados do Usuário
    private Long usuarioId;
    private String nome;
    private String username;
    private String email;
    private String corAvatar;

    // Dados do Perfil Gestor
    private String whatsapp;
    private String estado;
    private String cidade;
    private String nomeProdutora;
    private String tempoExperienciaGestao;
    private String generosMusicais;
    private String bio;
    private String linksProfissionais;

    public static PerfilGestorCompletoResponseDTO fromEntities(Usuario usuario, PerfilGestor perfil) {
        PerfilGestorCompletoResponseDTO dto = new PerfilGestorCompletoResponseDTO();

        // Dados do usuário
        dto.setUsuarioId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setUsername(usuario.getUsername());
        dto.setEmail(usuario.getEmail());
        dto.setCorAvatar(usuario.getCorAvatar());

        // Dados do perfil
        if (perfil != null) {
            dto.setWhatsapp(perfil.getWhatsapp());
            dto.setEstado(perfil.getEstado());
            dto.setCidade(perfil.getCidade());
            dto.setNomeProdutora(perfil.getNomeProdutora());
            dto.setTempoExperienciaGestao(perfil.getTempoExperienciaGestao());
            dto.setGenerosMusicais(perfil.getGenerosMusicais());
            dto.setBio(perfil.getBio());
            dto.setLinksProfissionais(perfil.getLinksProfissionais());
        }

        return dto;
    }
}

package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.PerfilMusico;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.domain.dto.PerfilUpdateDTO;
import com.musicMakers.Projeto.repository.PerfilMusicoRepository;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PerfilMusicoService {

    @Autowired
    private PerfilMusicoRepository perfilMusicoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public PerfilMusico buscarPorUsuarioId(Long usuarioId) {
        return perfilMusicoRepository.findByUsuarioId(usuarioId);
    }

    @org.springframework.transaction.annotation.Transactional
    public PerfilMusico salvarPerfilCompleto(Long usuarioId, PerfilUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Atualiza campos de Usuario
        if (dto.getNome() != null) usuario.setNome(dto.getNome());

        if (dto.getUsername() != null) {
            String novoUsername = dto.getUsername().trim();
            if (novoUsername.isEmpty()) {
                usuario.setUsername(null);
            } else {
                usuarioRepository.findByUsernameIgnoreCase(novoUsername).ifPresent(existente -> {
                    if (!existente.getId().equals(usuarioId)) {
                        throw new IllegalArgumentException("Username já está em uso.");
                    }
                });
                usuario.setUsername(novoUsername);
            }
        }

        if (dto.getCorAvatar() != null) usuario.setCorAvatar(dto.getCorAvatar());
        usuarioRepository.save(usuario);

        // Atualiza ou cria PerfilMusico
        PerfilMusico existente = perfilMusicoRepository.findByUsuarioId(usuarioId);
        if (existente == null) {
            existente = new PerfilMusico();
            existente.setUsuario(usuario);
        }

        if (dto.getLocalizacao() != null) {
            existente.setLocalizacao(dto.getLocalizacao());
        }
        if (dto.getPais() != null) {
            existente.setPais(dto.getPais());
        }
        if (dto.getEstado() != null) {
            existente.setEstado(dto.getEstado());
        }
        if (dto.getRegiao() != null) {
            existente.setRegiao(dto.getRegiao());
        }
        if (dto.getCidade() != null) {
            existente.setCidade(dto.getCidade());
        }
        if (dto.getBairro() != null) {
            existente.setBairro(dto.getBairro());
        }
        if (dto.getFuncao() != null) {
            existente.setFuncao(dto.getFuncao());
        }
        if (dto.getMinisteriosInteresse() != null) {
            existente.setMinisteriosInteresse(dto.getMinisteriosInteresse());
        }
        if (dto.getFormacaoMusical() != null) {
            existente.setFormacaoMusical(dto.getFormacaoMusical());
        }
        if (dto.getInstrumentosPrincipais() != null) {
            existente.setInstrumentosPrincipais(dto.getInstrumentosPrincipais());
        }
        if (dto.getBiografia() != null) {
            existente.setBiografia(dto.getBiografia());
        }
        if (dto.getLinkVideos() != null) {
            existente.setLinkVideos(dto.getLinkVideos());
        }

        if (dto.getNivelHabilidade() != null) {
            existente.setNivelHabilidade(dto.getNivelHabilidade());
        }
        if (dto.getTempoExperiencia() != null) {
            existente.setTempoExperiencia(dto.getTempoExperiencia());
        }
        if (dto.getGenerosMusicais() != null) {
            existente.setGenerosMusicais(dto.getGenerosMusicais());
        }
        if (dto.getInfluencias() != null) {
            existente.setInfluencias(dto.getInfluencias());
        }
        if (dto.getStatusBusca() != null) {
            existente.setStatusBusca(dto.getStatusBusca());
        }
        if (dto.getDisponibilidade() != null) {
            existente.setDisponibilidade(dto.getDisponibilidade());
        }
        if (dto.getEquipamento() != null) {
            existente.setEquipamento(dto.getEquipamento());
        }
        if (dto.getRedesSociais() != null) {
            existente.setRedesSociais(dto.getRedesSociais());
        }

        // Novos campos
        if (dto.getWhatsapp() != null) {
            existente.setWhatsapp(dto.getWhatsapp());
        }
        if (dto.getDataNascimento() != null) {
            existente.setDataNascimento(dto.getDataNascimento());
        }

        return perfilMusicoRepository.save(existente);
    }
}

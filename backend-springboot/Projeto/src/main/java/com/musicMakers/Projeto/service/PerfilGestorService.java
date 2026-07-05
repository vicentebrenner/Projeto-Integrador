package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.PerfilGestor;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.domain.dto.PerfilGestorUpdateDTO;
import com.musicMakers.Projeto.repository.PerfilGestorRepository;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PerfilGestorService {

    @Autowired
    private PerfilGestorRepository perfilGestorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public PerfilGestor buscarPorUsuarioId(Long usuarioId) {
        return perfilGestorRepository.findByUsuarioId(usuarioId);
    }

    @org.springframework.transaction.annotation.Transactional
    public PerfilGestor salvarPerfilCompleto(Long usuarioId, PerfilGestorUpdateDTO dto) {
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

        // Atualiza ou cria PerfilGestor
        PerfilGestor existente = perfilGestorRepository.findByUsuarioId(usuarioId);
        if (existente == null) {
            existente = new PerfilGestor();
            existente.setUsuario(usuario);
        }

        if (dto.getWhatsapp() != null) {
            existente.setWhatsapp(dto.getWhatsapp());
        }
        if (dto.getEstado() != null) {
            existente.setEstado(dto.getEstado());
        }
        if (dto.getCidade() != null) {
            existente.setCidade(dto.getCidade());
        }
        if (dto.getNomeProdutora() != null) {
            existente.setNomeProdutora(dto.getNomeProdutora());
        }
        if (dto.getTempoExperienciaGestao() != null) {
            existente.setTempoExperienciaGestao(dto.getTempoExperienciaGestao());
        }
        if (dto.getGenerosMusicais() != null) {
            existente.setGenerosMusicais(dto.getGenerosMusicais());
        }
        if (dto.getBio() != null) {
            existente.setBio(dto.getBio());
        }
        if (dto.getLinksProfissionais() != null) {
            existente.setLinksProfissionais(dto.getLinksProfissionais());
        }

        return perfilGestorRepository.save(existente);
    }
}

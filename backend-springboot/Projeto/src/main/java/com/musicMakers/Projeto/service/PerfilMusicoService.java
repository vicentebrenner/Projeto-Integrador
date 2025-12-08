package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.PerfilMusico;
import com.musicMakers.Projeto.domain.entity.Usuario;
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

    public PerfilMusico salvarPerfil(Long usuarioId, PerfilMusico perfil) {
        // CORREÇÃO: Removemos o Math.toIntExact. Passamos o Long direto.
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Verifica se já existe perfil para atualizar
        PerfilMusico existente = perfilMusicoRepository.findByUsuarioId(usuarioId);
        if (existente != null) {
            existente.setInstrumentosPrincipais(perfil.getInstrumentosPrincipais());
            existente.setBiografia(perfil.getBiografia());
            existente.setLinkVideos(perfil.getLinkVideos());
            return perfilMusicoRepository.save(existente);
        }

        perfil.setUsuario(usuario);
        return perfilMusicoRepository.save(perfil);
    }
}
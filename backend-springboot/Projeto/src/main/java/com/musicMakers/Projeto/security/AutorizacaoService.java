package com.musicMakers.Projeto.security;

import com.musicMakers.Projeto.domain.entity.MembroBanda;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.exception.AcessoNegadoException;
import com.musicMakers.Projeto.repository.MembroBandaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AutorizacaoService {

    @Autowired
    private MembroBandaRepository membroBandaRepository;

    public MembroBanda exigirMembroDaBanda(Long bandaId, Usuario usuario) {
        return membroBandaRepository.findByBandaIdAndUsuarioId(bandaId, usuario.getId())
                .orElseThrow(() -> new AcessoNegadoException("Você não é membro desta banda."));
    }

    public MembroBanda exigirGestorDaBanda(Long bandaId, Usuario usuario) {
        MembroBanda membro = exigirMembroDaBanda(bandaId, usuario);
        if (!Boolean.TRUE.equals(membro.getGestor())) {
            throw new AcessoNegadoException("Apenas o gestor da banda pode realizar esta ação.");
        }
        return membro;
    }

    public void exigirDonoRecurso(Long usuarioIdDoRecurso, Usuario usuarioAutenticado) {
        if (usuarioIdDoRecurso == null || !usuarioIdDoRecurso.equals(usuarioAutenticado.getId())) {
            throw new AcessoNegadoException("Você não tem permissão para acessar este recurso.");
        }
    }
}

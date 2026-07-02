package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.Candidatura;
import com.musicMakers.Projeto.domain.entity.PerfilMusico;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.domain.entity.Vaga;
import com.musicMakers.Projeto.repository.CandidaturaRepository;
import com.musicMakers.Projeto.repository.PerfilMusicoRepository;
import com.musicMakers.Projeto.repository.VagaRepository;
import com.musicMakers.Projeto.security.AutorizacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CandidaturaService {

    @Autowired
    private CandidaturaRepository candidaturaRepository;

    @Autowired
    private VagaRepository vagaRepository;

    @Autowired
    private PerfilMusicoRepository perfilMusicoRepository;

    @Autowired
    private AutorizacaoService autorizacaoService;

    @Transactional
    public Candidatura candidatar(Long vagaId, Usuario usuarioAutenticado) {
        PerfilMusico perfilMusico = perfilMusicoRepository.findByUsuarioId(usuarioAutenticado.getId());
        if (perfilMusico == null) {
            throw new RuntimeException("Complete seu perfil de músico antes de se candidatar.");
        }

        Vaga vaga = vagaRepository.findById(vagaId)
                .orElseThrow(() -> new RuntimeException("Vaga não encontrada"));

        if (!"ABERTA".equals(vaga.getStatus())) {
            throw new RuntimeException("Esta vaga não está mais aberta para candidaturas.");
        }

        candidaturaRepository.findByVagaIdAndPerfilMusicoId(vagaId, perfilMusico.getId())
                .ifPresent(c -> {
                    throw new RuntimeException("Você já se candidatou a esta vaga.");
                });

        Candidatura candidatura = new Candidatura();
        candidatura.setVaga(vaga);
        candidatura.setPerfilMusico(perfilMusico);
        candidatura.setStatus("PENDENTE");
        candidatura.setDataCandidatura(LocalDateTime.now());

        return candidaturaRepository.save(candidatura);
    }

    public List<Candidatura> listarPorVaga(Long vagaId, Usuario usuarioAutenticado) {
        Vaga vaga = vagaRepository.findById(vagaId)
                .orElseThrow(() -> new RuntimeException("Vaga não encontrada"));

        autorizacaoService.exigirGestorDaBanda(vaga.getBanda().getId(), usuarioAutenticado);

        return candidaturaRepository.findByVagaId(vagaId);
    }

    public List<Candidatura> listarMinhas(Usuario usuarioAutenticado) {
        return candidaturaRepository.findByPerfilMusico_UsuarioId(usuarioAutenticado.getId());
    }

    @Transactional
    public Candidatura atualizarStatus(Long candidaturaId, String novoStatus, Usuario usuarioAutenticado) {
        Candidatura candidatura = candidaturaRepository.findById(candidaturaId)
                .orElseThrow(() -> new RuntimeException("Candidatura não encontrada"));

        autorizacaoService.exigirGestorDaBanda(candidatura.getVaga().getBanda().getId(), usuarioAutenticado);

        if (!"PENDENTE".equals(candidatura.getStatus())) {
            throw new RuntimeException("Esta candidatura já foi avaliada.");
        }

        candidatura.setStatus(novoStatus);
        return candidaturaRepository.save(candidatura);
    }
}

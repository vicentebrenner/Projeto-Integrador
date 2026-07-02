package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.Banda;
import com.musicMakers.Projeto.domain.entity.Musica;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.repository.BandaRepository;
import com.musicMakers.Projeto.repository.MusicaRepository;
import com.musicMakers.Projeto.security.AutorizacaoService;
import com.musicMakers.Projeto.security.UsuarioAutenticadoProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MusicaService {

    @Autowired
    private MusicaRepository musicaRepository;

    @Autowired
    private BandaRepository bandaRepository;

    @Autowired
    private UsuarioAutenticadoProvider usuarioAutenticadoProvider;

    @Autowired
    private AutorizacaoService autorizacaoService;

    public List<Musica> listarPorBanda(Long bandaId) {
        return musicaRepository.findByBandaId(bandaId);
    }

    public Musica adicionarMusica(Long bandaId, Musica musica) {
        Banda banda = bandaRepository.findById(bandaId)
                .orElseThrow(() -> new RuntimeException("Banda não encontrada"));

        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirMembroDaBanda(bandaId, usuarioAtual);

        musica.setBanda(banda);
        return musicaRepository.save(musica);
    }

    public void deletarMusica(Long musicaId) {
        Musica musica = musicaRepository.findById(musicaId)
                .orElseThrow(() -> new RuntimeException("Música não encontrada"));

        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirMembroDaBanda(musica.getBanda().getId(), usuarioAtual);

        musicaRepository.deleteById(musicaId);
    }
}

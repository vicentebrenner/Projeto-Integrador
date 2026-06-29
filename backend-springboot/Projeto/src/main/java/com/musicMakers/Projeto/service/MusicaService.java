package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.Banda;
import com.musicMakers.Projeto.domain.entity.Musica;
import com.musicMakers.Projeto.repository.BandaRepository;
import com.musicMakers.Projeto.repository.MusicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MusicaService {

    @Autowired
    private MusicaRepository musicaRepository;

    @Autowired
    private BandaRepository bandaRepository;

    public List<Musica> listarPorBanda(Long bandaId) {
        return musicaRepository.findByBandaId(bandaId);
    }

    public Musica adicionarMusica(Long bandaId, Musica musica) {
        Banda banda = bandaRepository.findById(bandaId)
                .orElseThrow(() -> new RuntimeException("Banda não encontrada"));
        
        musica.setBanda(banda);
        return musicaRepository.save(musica);
    }

    public void deletarMusica(Long musicaId) {
        if (musicaRepository.existsById(musicaId)) {
            musicaRepository.deleteById(musicaId);
        } else {
            throw new RuntimeException("Música não encontrada");
        }
    }
}

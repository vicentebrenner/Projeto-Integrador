package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.Banda;
import com.musicMakers.Projeto.domain.entity.Vaga;
import com.musicMakers.Projeto.repository.BandaRepository;
import com.musicMakers.Projeto.repository.VagaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VagaService {

    @Autowired
    private VagaRepository vagaRepository;
    
    @Autowired
    private BandaRepository bandaRepository;

    public List<Vaga> listarAbertas() {
        return vagaRepository.findByStatus("ABERTA");
    }

    public Vaga criarVaga(Long bandaId, Vaga vaga) {
        Banda banda = bandaRepository.findById(bandaId)
                .orElseThrow(() -> new RuntimeException("Banda não encontrada"));
        vaga.setBanda(banda);
        vaga.setStatus("ABERTA");
        return vagaRepository.save(vaga);
    }
}
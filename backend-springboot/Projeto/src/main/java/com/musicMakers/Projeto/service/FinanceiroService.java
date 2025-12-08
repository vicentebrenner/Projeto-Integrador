package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.Banda;
import com.musicMakers.Projeto.domain.entity.Financeiro;
import com.musicMakers.Projeto.repository.BandaRepository;
import com.musicMakers.Projeto.repository.FinanceiroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDate;

@Service
public class FinanceiroService {

    @Autowired
    private FinanceiroRepository financeiroRepository;
    
    @Autowired
    private BandaRepository bandaRepository;

    public List<Financeiro> listarTransacoes(Long bandaId) {
        return financeiroRepository.findByBandaId(bandaId);
    }

    public Financeiro adicionarTransacao(Long bandaId, Financeiro financeiro) {
        Banda banda = bandaRepository.findById(bandaId)
                .orElseThrow(() -> new RuntimeException("Banda não encontrada"));
        
        financeiro.setBanda(banda);
        if(financeiro.getDataTransacao() == null) {
            financeiro.setDataTransacao(LocalDate.now());
        }
        return financeiroRepository.save(financeiro);
    }
}
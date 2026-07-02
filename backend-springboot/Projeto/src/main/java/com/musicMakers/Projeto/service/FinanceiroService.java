package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.Banda;
import com.musicMakers.Projeto.domain.entity.Financeiro;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.domain.dto.FinanceiroUpdateDTO;
import com.musicMakers.Projeto.repository.BandaRepository;
import com.musicMakers.Projeto.repository.FinanceiroRepository;
import com.musicMakers.Projeto.security.AutorizacaoService;
import com.musicMakers.Projeto.security.UsuarioAutenticadoProvider;
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

    @Autowired
    private UsuarioAutenticadoProvider usuarioAutenticadoProvider;

    @Autowired
    private AutorizacaoService autorizacaoService;

    public List<Financeiro> listarTransacoes(Long bandaId) {
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirMembroDaBanda(bandaId, usuarioAtual);
        return financeiroRepository.findByBandaId(bandaId);
    }

    public Financeiro adicionarTransacao(Long bandaId, Financeiro financeiro) {
        Banda banda = bandaRepository.findById(bandaId)
                .orElseThrow(() -> new RuntimeException("Banda não encontrada"));

        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirMembroDaBanda(bandaId, usuarioAtual);

        financeiro.setBanda(banda);
        if(financeiro.getDataTransacao() == null) {
            financeiro.setDataTransacao(LocalDate.now());
        }
        return financeiroRepository.save(financeiro);
    }

    public void deletarTransacao(Long id) {
        Financeiro financeiro = financeiroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));

        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirMembroDaBanda(financeiro.getBanda().getId(), usuarioAtual);

        financeiroRepository.deleteById(id);
    }

    public Financeiro atualizarTransacao(Long id, FinanceiroUpdateDTO dto) {
        Financeiro financeiro = financeiroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));

        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirMembroDaBanda(financeiro.getBanda().getId(), usuarioAtual);

        if (dto.getTipo() != null) {
            financeiro.setTipo(dto.getTipo());
        }
        if (dto.getDescricao() != null) {
            financeiro.setDescricao(dto.getDescricao());
        }
        if (dto.getValor() != null) {
            financeiro.setValor(dto.getValor());
        }
        if (dto.getDataTransacao() != null) {
            financeiro.setDataTransacao(dto.getDataTransacao());
        }
        if (dto.getCategoria() != null) {
            financeiro.setCategoria(dto.getCategoria());
        }

        return financeiroRepository.save(financeiro);
    }
}

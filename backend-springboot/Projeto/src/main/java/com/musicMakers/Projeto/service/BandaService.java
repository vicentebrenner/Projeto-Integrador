package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.Banda;
import com.musicMakers.Projeto.domain.entity.MembroBanda;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.domain.dto.BandaUpdateDTO;
import com.musicMakers.Projeto.repository.BandaRepository;
import com.musicMakers.Projeto.repository.MembroBandaRepository;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import com.musicMakers.Projeto.repository.PermissaoMembroRepository;
import com.musicMakers.Projeto.security.AutorizacaoService;
import com.musicMakers.Projeto.security.UsuarioAutenticadoProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BandaService {

    @Autowired
    private BandaRepository bandaRepository;

    @Autowired
    private MembroBandaRepository membroBandaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PermissaoMembroRepository permissaoMembroRepository;

    @Autowired
    private UsuarioAutenticadoProvider usuarioAutenticadoProvider;

    @Autowired
    private AutorizacaoService autorizacaoService;

    public List<Banda> listarTodas() {
        return bandaRepository.findAll();
    }

    public Banda buscarPorId(Long id) {
        return bandaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banda não encontrada"));
    }

    @Transactional
    public Banda criarBanda(Banda banda, Long idUsuarioCriador) {
        // Salva a banda
        Banda novaBanda = bandaRepository.save(banda);

        // CORREÇÃO: Passamos o Long direto, sem converter para int
        Usuario criador = usuarioRepository.findById(idUsuarioCriador) 
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        MembroBanda membro = new MembroBanda();
        membro.setBanda(novaBanda);
        membro.setUsuario(criador);
        membro.setFuncao("Fundador");
        membro.setGestor(true);
        
        membroBandaRepository.save(membro);

        return novaBanda;
    }
    
    public void deletarBanda(Long id) {
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirGestorDaBanda(id, usuarioAtual);
        bandaRepository.deleteById(id);
    }

    @Transactional
    public void removerMembro(Long membroId) {
        MembroBanda membro = membroBandaRepository.findById(membroId)
                .orElseThrow(() -> new RuntimeException("Membro não encontrado"));
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirGestorDaBanda(membro.getBanda().getId(), usuarioAtual);
        permissaoMembroRepository.deleteAllByMembroBandaId(membroId);
        membroBandaRepository.deleteById(membroId);
    }

    @Transactional
    public Banda atualizarBanda(Long id, BandaUpdateDTO dto) {
        Banda banda = bandaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banda não encontrada"));
        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirGestorDaBanda(id, usuarioAtual);

        if (dto.getNome() != null) {
            banda.setNome(dto.getNome());
        }
        if (dto.getGeneroMusical() != null) {
            banda.setGeneroMusical(dto.getGeneroMusical());
        }
        if (dto.getDescricao() != null) {
            banda.setDescricao(dto.getDescricao());
        }
        if (dto.getDataFormacao() != null) {
            banda.setDataFormacao(dto.getDataFormacao());
        }

        return bandaRepository.save(banda);
    }
}
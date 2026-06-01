package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.*;
import com.musicMakers.Projeto.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ConviteService {

    @Autowired
    private ConviteBandaRepository conviteRepository;

    @Autowired
    private BandaRepository bandaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MembroBandaRepository membroBandaRepository;

    @Autowired
    private PermissaoMembroRepository permissaoRepository;

    public List<ConviteBanda> listarPendentes(Long usuarioId) {
        return conviteRepository.findByUsuarioConvidadoIdAndStatus(usuarioId, "PENDENTE");
    }

    public List<ConviteBanda> listarEnviados(Long bandaId) {
        return conviteRepository.findByBandaId(bandaId);
    }

    @Transactional
    public ConviteBanda enviarConvite(Long bandaId, Long gestorId, Long usuarioConvidadoId) {
        Banda banda = bandaRepository.findById(bandaId)
                .orElseThrow(() -> new RuntimeException("Banda não encontrada"));

        Usuario gestor = usuarioRepository.findById(gestorId)
                .orElseThrow(() -> new RuntimeException("Gestor não encontrado"));

        Usuario convidado = usuarioRepository.findById(usuarioConvidadoId)
                .orElseThrow(() -> new RuntimeException("Músico convidado não encontrado"));

        // Verificar se já é membro da banda
        List<MembroBanda> membros = membroBandaRepository.findByBandaId(bandaId);
        boolean jaEhMembro = membros.stream()
                .anyMatch(m -> m.getUsuario().getId().equals(usuarioConvidadoId));
        if (jaEhMembro) {
            throw new RuntimeException("Este músico já é integrante da sua banda.");
        }

        // Verificar se já tem convite pendente
        Optional<ConviteBanda> convitePendente = conviteRepository
                .findFirstByBandaIdAndUsuarioConvidadoIdAndStatus(bandaId, usuarioConvidadoId, "PENDENTE");
        if (convitePendente.isPresent()) {
            throw new RuntimeException("Já existe um convite pendente para este músico.");
        }

        ConviteBanda convite = new ConviteBanda();
        convite.setBanda(banda);
        convite.setUsuarioGestor(gestor);
        convite.setUsuarioConvidado(convidado);
        convite.setStatus("PENDENTE");
        convite.setDataEnvio(LocalDateTime.now());

        return conviteRepository.save(convite);
    }

    @Transactional
    public MembroBanda aceitarConvite(Long conviteId, Long usuarioId) {
        ConviteBanda convite = conviteRepository.findById(conviteId)
                .orElseThrow(() -> new RuntimeException("Convite não encontrado"));

        if (!convite.getUsuarioConvidado().getId().equals(usuarioId)) {
            throw new RuntimeException("Este convite não pertence a você.");
        }

        if (!"PENDENTE".equals(convite.getStatus())) {
            throw new RuntimeException("Este convite já foi respondido ou cancelado.");
        }

        convite.setStatus("ACEITO");
        convite.setDataResposta(LocalDateTime.now());
        conviteRepository.save(convite);

        // Criar MembroBanda
        MembroBanda membro = new MembroBanda();
        membro.setBanda(convite.getBanda());
        membro.setUsuario(convite.getUsuarioConvidado());
        membro.setGestor(false);

        String funcao = "Músico";
        if (convite.getUsuarioConvidado().getPerfilMusico() != null &&
                convite.getUsuarioConvidado().getPerfilMusico().getInstrumentosPrincipais() != null) {
            funcao = convite.getUsuarioConvidado().getPerfilMusico().getInstrumentosPrincipais();
        }
        membro.setFuncao(funcao);

        MembroBanda novoMembro = membroBandaRepository.save(membro);

        // Criar permissões padrão (todas false)
        List<String> modulos = List.of("agenda", "financeiro", "membros", "repertorio");
        for (String modulo : modulos) {
            PermissaoMembro p = new PermissaoMembro();
            p.setMembroBanda(novoMembro);
            p.setModulo(modulo);
            p.setPermitido(false);
            permissaoRepository.save(p);
        }

        return novoMembro;
    }

    @Transactional
    public void recusarConvite(Long conviteId, Long usuarioId) {
        ConviteBanda convite = conviteRepository.findById(conviteId)
                .orElseThrow(() -> new RuntimeException("Convite não encontrado"));

        if (!convite.getUsuarioConvidado().getId().equals(usuarioId)) {
            throw new RuntimeException("Este convite não pertence a você.");
        }

        if (!"PENDENTE".equals(convite.getStatus())) {
            throw new RuntimeException("Este convite já foi respondido ou cancelado.");
        }

        convite.setStatus("RECUSADO");
        convite.setDataResposta(LocalDateTime.now());
        conviteRepository.save(convite);
    }

    @Transactional
    public void cancelarConvite(Long id) {
        conviteRepository.deleteById(id);
    }
}

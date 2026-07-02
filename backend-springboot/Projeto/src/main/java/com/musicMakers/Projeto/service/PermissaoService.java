package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.entity.MembroBanda;
import com.musicMakers.Projeto.domain.entity.PermissaoMembro;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.repository.MembroBandaRepository;
import com.musicMakers.Projeto.repository.PermissaoMembroRepository;
import com.musicMakers.Projeto.security.AutorizacaoService;
import com.musicMakers.Projeto.security.UsuarioAutenticadoProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class PermissaoService {

    // Módulos controláveis pelo gestor
    public static final List<String> MODULOS = List.of("agenda", "financeiro", "membros", "repertorio");

    @Autowired
    private PermissaoMembroRepository permissaoRepository;

    @Autowired
    private MembroBandaRepository membroBandaRepository;

    @Autowired
    private UsuarioAutenticadoProvider usuarioAutenticadoProvider;

    @Autowired
    private AutorizacaoService autorizacaoService;

    /**
     * Retorna um Map de módulo → permitido para um membro específico.
     * Módulos sem registro são tratados como bloqueados (false).
     */
    public Map<String, Boolean> buscarPermissoes(Long membroId) {
        List<PermissaoMembro> registros = permissaoRepository.findByMembroBandaId(membroId);

        Map<String, Boolean> permissoes = new LinkedHashMap<>();
        for (String modulo : MODULOS) {
            permissoes.put(modulo, false); // padrão: bloqueado
        }
        for (PermissaoMembro p : registros) {
            if (MODULOS.contains(p.getModulo())) {
                permissoes.put(p.getModulo(), Boolean.TRUE.equals(p.getPermitido()));
            }
        }
        return permissoes;
    }

    /**
     * Salva (substitui) todas as permissões de um membro.
     * @param membroId ID do MembroBanda
     * @param permissoes Map de modulo → permitido
     */
    @Transactional
    public Map<String, Boolean> salvarPermissoes(Long membroId, Map<String, Boolean> permissoes) {
        MembroBanda membro = membroBandaRepository.findById(membroId)
                .orElseThrow(() -> new RuntimeException("Membro não encontrado: " + membroId));

        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirGestorDaBanda(membro.getBanda().getId(), usuarioAtual);

        // Remove todas as permissões existentes deste membro e grava novamente
        permissaoRepository.deleteAllByMembroBandaId(membroId);

        List<PermissaoMembro> novas = new ArrayList<>();
        for (String modulo : MODULOS) {
            PermissaoMembro p = new PermissaoMembro();
            p.setMembroBanda(membro);
            p.setModulo(modulo);
            p.setPermitido(permissoes.getOrDefault(modulo, false));
            novas.add(p);
        }
        permissaoRepository.saveAll(novas);

        return buscarPermissoes(membroId);
    }

    /**
     * Retorna todos os membros de uma banda com suas permissões.
     * Retorna lista de Maps com: membroId, nome, email, funcao, permissoes
     */
    public List<Map<String, Object>> buscarPermissoesDaBanda(Long bandaId) {
        List<MembroBanda> membros = membroBandaRepository.findByBandaId(bandaId);
        List<Map<String, Object>> resultado = new ArrayList<>();

        for (MembroBanda membro : membros) {
            // Gestores não precisam de permissões configuradas (acesso total)
            if (Boolean.TRUE.equals(membro.getGestor())) continue;

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("membroId", membro.getId());
            entry.put("usuarioId", membro.getUsuario().getId());
            entry.put("nome", membro.getUsuario().getNome());
            entry.put("email", membro.getUsuario().getEmail());
            entry.put("funcao", membro.getFuncao());
            entry.put("permissoes", buscarPermissoes(membro.getId()));
            resultado.add(entry);
        }
        return resultado;
    }
}

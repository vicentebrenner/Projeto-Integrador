package com.musicMakers.Projeto.service;

import com.musicMakers.Projeto.domain.dto.CandidatoCompativelDTO;
import com.musicMakers.Projeto.domain.dto.VagaRequestDTO;
import com.musicMakers.Projeto.domain.entity.Banda;
import com.musicMakers.Projeto.domain.entity.Candidatura;
import com.musicMakers.Projeto.domain.entity.PerfilMusico;
import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.domain.entity.Vaga;
import com.musicMakers.Projeto.repository.BandaRepository;
import com.musicMakers.Projeto.repository.CandidaturaRepository;
import com.musicMakers.Projeto.repository.PerfilMusicoRepository;
import com.musicMakers.Projeto.repository.VagaRepository;
import com.musicMakers.Projeto.security.AutorizacaoService;
import com.musicMakers.Projeto.security.UsuarioAutenticadoProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class VagaService {

    @Autowired
    private VagaRepository vagaRepository;

    @Autowired
    private BandaRepository bandaRepository;

    @Autowired
    private PerfilMusicoRepository perfilMusicoRepository;

    @Autowired
    private CandidaturaRepository candidaturaRepository;

    @Autowired
    private UsuarioAutenticadoProvider usuarioAutenticadoProvider;

    @Autowired
    private AutorizacaoService autorizacaoService;

    public List<Vaga> listarAbertas() {
        return vagaRepository.findByStatus("ABERTA");
    }

    public List<Vaga> listarPorBanda(Long bandaId) {
        return vagaRepository.findByBandaId(bandaId);
    }

    public Vaga criarVaga(Long bandaId, VagaRequestDTO dto) {
        Banda banda = bandaRepository.findById(bandaId)
                .orElseThrow(() -> new RuntimeException("Banda não encontrada"));

        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirGestorDaBanda(bandaId, usuarioAtual);

        Vaga vaga = new Vaga();
        vaga.setBanda(banda);
        vaga.setTitulo(dto.getTitulo());
        vaga.setInstrumentoNecessario(dto.getInstrumentoNecessario());
        vaga.setDescricao(dto.getDescricao());
        vaga.setQuantidadeVagas(dto.getQuantidadeVagas() != null ? dto.getQuantidadeVagas() : 1);
        vaga.setResponsabilidades(dto.getResponsabilidades());
        vaga.setRequisitosObrigatorios(dto.getRequisitosObrigatorios());
        vaga.setRequisitosDesejaveis(dto.getRequisitosDesejaveis());
        vaga.setNivelExperiencia(dto.getNivelExperiencia());
        vaga.setDataLimite(dto.getDataLimite());
        vaga.setPais(dto.getPais());
        vaga.setEstado(dto.getEstado());
        vaga.setRegiao(dto.getRegiao());
        vaga.setCidade(dto.getCidade());
        vaga.setBairro(dto.getBairro());
        vaga.setFuncao(dto.getFuncao());
        vaga.setStatus("ABERTA");

        return vagaRepository.save(vaga);
    }

    public Vaga atualizarVaga(Long id, VagaRequestDTO dto) {
        Vaga vaga = vagaRepository.findById(id).orElseThrow(() -> new RuntimeException("Vaga não encontrada"));

        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirGestorDaBanda(vaga.getBanda().getId(), usuarioAtual);

        if (dto.getTitulo() != null) {
            vaga.setTitulo(dto.getTitulo());
        }
        if (dto.getDescricao() != null) {
            vaga.setDescricao(dto.getDescricao());
        }
        if (dto.getInstrumentoNecessario() != null) {
            vaga.setInstrumentoNecessario(dto.getInstrumentoNecessario());
        }
        if (dto.getQuantidadeVagas() != null) {
            vaga.setQuantidadeVagas(dto.getQuantidadeVagas());
        }
        if (dto.getResponsabilidades() != null) {
            vaga.setResponsabilidades(dto.getResponsabilidades());
        }
        if (dto.getRequisitosObrigatorios() != null) {
            vaga.setRequisitosObrigatorios(dto.getRequisitosObrigatorios());
        }
        if (dto.getRequisitosDesejaveis() != null) {
            vaga.setRequisitosDesejaveis(dto.getRequisitosDesejaveis());
        }
        if (dto.getNivelExperiencia() != null) {
            vaga.setNivelExperiencia(dto.getNivelExperiencia());
        }
        if (dto.getDataLimite() != null) {
            vaga.setDataLimite(dto.getDataLimite());
        }
        if (dto.getPais() != null) {
            vaga.setPais(dto.getPais());
        }
        if (dto.getEstado() != null) {
            vaga.setEstado(dto.getEstado());
        }
        if (dto.getRegiao() != null) {
            vaga.setRegiao(dto.getRegiao());
        }
        if (dto.getCidade() != null) {
            vaga.setCidade(dto.getCidade());
        }
        if (dto.getBairro() != null) {
            vaga.setBairro(dto.getBairro());
        }
        if (dto.getFuncao() != null) {
            vaga.setFuncao(dto.getFuncao());
        }
        if (dto.getStatus() != null) {
            vaga.setStatus(dto.getStatus());
        }

        return vagaRepository.save(vaga);
    }

    public Vaga buscarPorId(Long id) {
        return vagaRepository.findById(id).orElseThrow(() -> new RuntimeException("Vaga não encontrada"));
    }

    public List<CandidatoCompativelDTO> buscarCandidatosCompativeis(Long vagaId) {
        Vaga vaga = buscarPorId(vagaId);

        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirGestorDaBanda(vaga.getBanda().getId(), usuarioAtual);

        List<PerfilMusico> todosPerfis = perfilMusicoRepository.findAll();
        List<Candidatura> candidaturas = candidaturaRepository.findByVagaId(vagaId);

        List<CandidatoCompativelDTO> compativeis = new ArrayList<>();

        for (PerfilMusico perfil : todosPerfis) {
            int score = 0;

            // +40 pontos: Instrumento ou Função compatível
            if (vaga.getInstrumentoNecessario() != null && perfil.getInstrumentosPrincipais() != null
                && perfil.getInstrumentosPrincipais().toLowerCase().contains(vaga.getInstrumentoNecessario().toLowerCase())) {
                score += 40;
            } else if (vaga.getFuncao() != null && perfil.getFuncao() != null
                && perfil.getFuncao().equalsIgnoreCase(vaga.getFuncao())) {
                score += 40;
            }

            // Regras geográficas
            if (vaga.getCidade() != null && !vaga.getCidade().isEmpty() && perfil.getCidade() != null) {
                if (vaga.getCidade().equalsIgnoreCase(perfil.getCidade())) {
                    score += 20;
                }
            }

            if (vaga.getRegiao() != null && !vaga.getRegiao().isEmpty() && perfil.getRegiao() != null) {
                if (vaga.getRegiao().equalsIgnoreCase(perfil.getRegiao())) {
                    score += 15;
                }
            }

            if (vaga.getEstado() != null && !vaga.getEstado().isEmpty() && perfil.getEstado() != null) {
                if (vaga.getEstado().equalsIgnoreCase(perfil.getEstado())) {
                    score += 10;
                }
            }

            // Experiência
            if (vaga.getNivelExperiencia() != null && perfil.getNivelHabilidade() != null) {
                if (vaga.getNivelExperiencia().equalsIgnoreCase(perfil.getNivelHabilidade())) {
                    score += 10;
                }
            }

            // Disponibilidade
            if (perfil.getDisponibilidade() != null && !perfil.getDisponibilidade().isEmpty()) {
                score += 5; // Simplified
            }

            // Limitar a 100
            if (score > 100) score = 100;

            // Filtrar apenas candidatos com algum score (ou minimo)
            // Se for exigência geográfica estrita, poderiamos ignorar quem não atende.
            // Como é um algoritmo de recomendação, podemos retornar quem tem > 0% e deixar o gestor ver.
            if (score > 0) {
                // Verificar status de candidatura
                String statusCandidatura = "NAO_CANDIDATADO";
                Optional<Candidatura> cand = candidaturas.stream().filter(c -> c.getPerfilMusico().getId().equals(perfil.getId())).findFirst();
                if (cand.isPresent()) {
                    statusCandidatura = cand.get().getStatus(); // EX: PENDENTE, APROVADO, REJEITADO
                }

                String nomeMusico = perfil.getUsuario() != null ? perfil.getUsuario().getNome() : null;

                compativeis.add(new CandidatoCompativelDTO(perfil, score, statusCandidatura, nomeMusico));
            }
        }

        // Ordenar decrescente por score
        compativeis.sort(Comparator.comparingInt(CandidatoCompativelDTO::getPercentualCompatibilidade).reversed());
        return compativeis;
    }

    public void deletarVaga(Long id) {
        Vaga vaga = vagaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vaga não encontrada"));

        Usuario usuarioAtual = usuarioAutenticadoProvider.getUsuarioAutenticado();
        autorizacaoService.exigirGestorDaBanda(vaga.getBanda().getId(), usuarioAtual);

        vagaRepository.deleteById(id);
    }
}

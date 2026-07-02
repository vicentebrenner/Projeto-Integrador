package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.Candidatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidaturaRepository extends JpaRepository<Candidatura, Long> {
    List<Candidatura> findByVagaId(Long vagaId);
    List<Candidatura> findByPerfilMusicoId(Long perfilMusicoId);
    Optional<Candidatura> findByVagaIdAndPerfilMusicoId(Long vagaId, Long perfilMusicoId);
    List<Candidatura> findByPerfilMusico_UsuarioId(Long usuarioId);
}
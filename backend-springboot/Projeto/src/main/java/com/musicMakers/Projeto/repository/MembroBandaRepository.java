package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.MembroBanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MembroBandaRepository extends JpaRepository<MembroBanda, Long> {
    List<MembroBanda> findByBandaId(Long bandaId);
    List<MembroBanda> findByUsuarioId(Long usuarioId);
}
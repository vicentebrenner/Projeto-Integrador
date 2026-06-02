package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.ConviteBanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConviteBandaRepository extends JpaRepository<ConviteBanda, Long> {
    List<ConviteBanda> findByUsuarioConvidadoIdAndStatus(Long usuarioId, String status);
    List<ConviteBanda> findByBandaId(Long bandaId);
    Optional<ConviteBanda> findFirstByBandaIdAndUsuarioConvidadoIdAndStatus(Long bandaId, Long usuarioId, String status);
}

package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.Vaga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VagaRepository extends JpaRepository<Vaga, Long> {
    List<Vaga> findByBandaId(Long bandaId);
    List<Vaga> findByStatus(String status);
}
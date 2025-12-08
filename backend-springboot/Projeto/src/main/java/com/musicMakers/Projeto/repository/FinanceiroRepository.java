package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.Financeiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FinanceiroRepository extends JpaRepository<Financeiro, Long> {
    List<Financeiro> findByBandaId(Long bandaId);
}
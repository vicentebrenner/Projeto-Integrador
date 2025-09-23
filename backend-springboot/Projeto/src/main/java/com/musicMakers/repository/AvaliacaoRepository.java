package com.musicMakers.repository;

import com.musicMakers.domain.entity.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {
}
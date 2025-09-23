package com.musicMakers.repository;

import com.musicMakers.domain.entity.Inscricao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InscricaoRepository extends JpaRepository<Inscricao, Integer> {
}
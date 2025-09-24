package com.musicMakers.Projeto.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.musicMakers.Projeto.domain.entity.Avaliacao;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {
}
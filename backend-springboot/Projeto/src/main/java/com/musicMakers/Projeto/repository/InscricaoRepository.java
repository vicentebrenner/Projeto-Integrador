package com.musicMakers.Projeto.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.musicMakers.Projeto.domain.entity.Inscricao;

public interface InscricaoRepository extends JpaRepository<Inscricao, Integer> {
}
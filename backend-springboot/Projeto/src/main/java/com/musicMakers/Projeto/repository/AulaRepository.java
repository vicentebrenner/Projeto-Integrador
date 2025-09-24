package com.musicMakers.Projeto.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.musicMakers.Projeto.domain.entity.Aula;

public interface AulaRepository extends JpaRepository<Aula, Integer> {
}
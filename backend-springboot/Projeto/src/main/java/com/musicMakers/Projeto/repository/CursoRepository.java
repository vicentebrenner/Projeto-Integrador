package com.musicMakers.Projeto.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.musicMakers.Projeto.domain.entity.Curso;

public interface CursoRepository extends JpaRepository<Curso, Integer> {
}
package com.musicMakers.Projeto.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.musicMakers.Projeto.domain.entity.Professor;

public interface ProfessorRepository extends JpaRepository<Professor, Integer> {
}
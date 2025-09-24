package com.musicMakers.Projeto.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.musicMakers.Projeto.domain.entity.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
}
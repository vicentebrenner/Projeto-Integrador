package com.musicMakers.Projeto.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.musicMakers.Projeto.domain.entity.Venda;

public interface VendaRepository extends JpaRepository<Venda, Integer> {
}
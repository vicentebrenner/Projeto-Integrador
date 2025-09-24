package com.musicMakers.Projeto.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.musicMakers.Projeto.domain.entity.Pagamento;

public interface PagamentoRepository extends JpaRepository<Pagamento, Integer> {
}
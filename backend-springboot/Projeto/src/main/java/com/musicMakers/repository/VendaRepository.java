package com.musicMakers.repository;

import com.musicMakers.domain.entity.Venda;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendaRepository extends JpaRepository<Venda, Integer> {
}
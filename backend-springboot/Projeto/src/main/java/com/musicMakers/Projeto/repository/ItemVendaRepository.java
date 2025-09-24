package com.musicMakers.Projeto.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.musicMakers.Projeto.domain.entity.ItemVenda;
import com.musicMakers.Projeto.domain.entity.pk.ItemVendaPK;

public interface ItemVendaRepository extends JpaRepository<ItemVenda, ItemVendaPK> {
}
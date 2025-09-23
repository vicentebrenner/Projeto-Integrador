package com.musicMakers.repository;

import com.musicMakers.domain.entity.ItemVenda;
import com.musicMakers.domain.entity.pk.ItemVendaPK;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemVendaRepository extends JpaRepository<ItemVenda, ItemVendaPK> {
}
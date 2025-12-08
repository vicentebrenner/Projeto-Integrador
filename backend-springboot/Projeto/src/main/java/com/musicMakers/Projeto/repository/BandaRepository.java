package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.Banda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BandaRepository extends JpaRepository<Banda, Long> {
    // Pode adicionar métodos personalizados, ex: findByNomeContaining(String nome);
}
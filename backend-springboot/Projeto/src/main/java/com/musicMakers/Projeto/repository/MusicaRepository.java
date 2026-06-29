package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.Musica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MusicaRepository extends JpaRepository<Musica, Long> {
    List<Musica> findByBandaId(Long bandaId);
}

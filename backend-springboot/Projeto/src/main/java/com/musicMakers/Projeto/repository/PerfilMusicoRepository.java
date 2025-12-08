package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.PerfilMusico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PerfilMusicoRepository extends JpaRepository<PerfilMusico, Long> {
    PerfilMusico findByUsuarioId(Long usuarioId);
}
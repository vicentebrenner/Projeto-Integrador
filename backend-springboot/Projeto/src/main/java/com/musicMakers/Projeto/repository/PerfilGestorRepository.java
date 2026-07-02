package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.PerfilGestor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PerfilGestorRepository extends JpaRepository<PerfilGestor, Long> {
    PerfilGestor findByUsuarioId(Long usuarioId);
}

package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// A anotação @Repository é opcional, mas recomendada.
// O mais importante é ser uma INTERFACE que estende JpaRepository.
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

}
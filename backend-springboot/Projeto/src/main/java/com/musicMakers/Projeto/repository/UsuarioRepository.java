package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // O retorno Optional é crucial para evitar NullPointerException e 
    // permitir o uso de .isEmpty() ou .isPresent() nas verificações.
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByUsernameIgnoreCase(String username);

    java.util.List<Usuario> findByUsernameContainingIgnoreCaseAndTipoUsuario(String username, String tipoUsuario);

    java.util.List<Usuario> findByNomeContainingIgnoreCaseAndTipoUsuario(String nome, String tipoUsuario);

    // Se precisar verificar login de outra forma futuramente:
    // Optional<Usuario> findByEmailAndSenha(String email, String senha);
}
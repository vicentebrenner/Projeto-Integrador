package com.musicMakers.service;

import com.musicMakers.domain.entity.Usuario;
import com.musicMakers.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public Usuario salvar(Usuario usuario) {
        // Você pode adicionar regras de negócio aqui antes de salvar
        // Ex: Verificar se o e-mail já existe, criptografar a senha, etc.
        return usuarioRepository.save(usuario);
    }

    // No futuro, você pode criar outros métodos aqui, como:
    // - buscarPorId(Integer id)
    // - listarTodos()
    // - deletar(Integer id)
}
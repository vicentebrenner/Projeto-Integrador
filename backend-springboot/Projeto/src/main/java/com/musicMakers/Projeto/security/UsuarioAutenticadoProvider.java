package com.musicMakers.Projeto.security;

import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.exception.AcessoNegadoException;
import com.musicMakers.Projeto.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class UsuarioAutenticadoProvider {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario getUsuarioAutenticado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new AcessoNegadoException("Usuário autenticado não encontrado."));
    }
}

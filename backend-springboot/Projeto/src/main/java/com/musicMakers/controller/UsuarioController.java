package com.musicMakers.controller;

import com.musicMakers.domain.entity.Usuario;
import com.musicMakers.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario criarUsuario(@RequestBody Usuario usuario) {
        return usuarioService.salvar(usuario);
    }

    // Aqui você poderá criar outros "endpoints", como:
    // @GetMapping("/{id}") para buscar um usuário por ID
    // @GetMapping para listar todos os usuários
    // @DeleteMapping("/{id}") para deletar um usuário
}
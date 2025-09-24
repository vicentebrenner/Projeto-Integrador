package com.musicMakers.controller;

import com.musicMakers.domain.entity.Usuario;
import com.musicMakers.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Endpoint para CRIAR um novo usuário
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario criarUsuario(@RequestBody Usuario usuario) {
        return usuarioService.salvar(usuario);
    }

    // Endpoint para BUSCAR um usuário por ID (ex: GET /api/usuarios/1)
    @GetMapping("/{id}")
    public Usuario getUsuarioById(@PathVariable Integer id) {
        return usuarioService.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

    // Endpoint para LISTAR TODOS os usuários (ex: GET /api/usuarios)
    @GetMapping
    public List<Usuario> listarTodos() {
        return usuarioService.listarTodos();
    }

    // Endpoint para DELETAR um usuário por ID (ex: DELETE /api/usuarios/1)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarUsuario(@PathVariable Integer id) {
        usuarioService.buscarPorId(id)
                .map(usuario -> {
                    usuarioService.deletar(usuario.getId());
                    return Void.TYPE;
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }
    
    // Endpoint para ATUALIZAR um usuário por ID (ex: PUT /api/usuarios/1)
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Usuario atualizarUsuario(@PathVariable Integer id, @RequestBody Usuario usuarioAtualizado) {
        return usuarioService.buscarPorId(id)
                .map(usuarioExistente -> {
                    usuarioAtualizado.setId(usuarioExistente.getId());
                    return usuarioService.salvar(usuarioAtualizado);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }
}
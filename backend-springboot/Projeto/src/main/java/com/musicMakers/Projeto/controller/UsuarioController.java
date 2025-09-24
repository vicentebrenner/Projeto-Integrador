package com.musicMakers.Projeto.controller;

import com.musicMakers.Projeto.domain.entity.Usuario;
import com.musicMakers.Projeto.service.UsuarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario criarUsuario(@RequestBody Usuario usuario) {
        return usuarioService.salvar(usuario);
    }

    @GetMapping("/{id}")
    public Usuario getUsuarioById(@PathVariable Integer id) {
        return usuarioService.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

    @GetMapping
    public List<Usuario> listarTodos() {
        return usuarioService.listarTodos();
    }

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
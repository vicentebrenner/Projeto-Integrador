package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String email;
    private String senha;
    
    @Column(name = "tipo_usuario")
    private String tipoUsuario; // Use String ou crie um Enum depois

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro = LocalDateTime.now();
    
    // Relacionamento opcional com PerfilMusico
    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL)
    private PerfilMusico perfilMusico;
}
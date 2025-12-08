package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@Table(name = "banda")
public class Banda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    
    @Column(name = "genero_musical")
    private String generoMusical;
    
    @Column(name = "data_formacao")
    private LocalDate dataFormacao;
    
    private String descricao;

    @OneToMany(mappedBy = "banda")
    private List<MembroBanda> membros;
}
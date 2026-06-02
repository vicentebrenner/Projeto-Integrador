package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "permissao_membro", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"membro_banda_id", "modulo"})
})
public class PermissaoMembro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "membro_banda_id", nullable = false)
    private MembroBanda membroBanda;

    /**
     * Identificador do módulo: 'agenda', 'financeiro', 'membros', 'repertorio'
     */
    @Column(nullable = false, length = 50)
    private String modulo;

    @Column(nullable = false)
    private Boolean permitido = false;
}

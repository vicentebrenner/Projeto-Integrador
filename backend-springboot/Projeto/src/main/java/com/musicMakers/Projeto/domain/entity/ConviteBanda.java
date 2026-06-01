package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "convite_banda")
public class ConviteBanda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "banda_id", nullable = false)
    private Banda banda;

    @ManyToOne
    @JoinColumn(name = "usuario_convidado_id", nullable = false)
    private Usuario usuarioConvidado;

    @ManyToOne
    @JoinColumn(name = "usuario_gestor_id", nullable = false)
    private Usuario usuarioGestor;

    @Column(nullable = false, length = 20)
    private String status = "PENDENTE"; // PENDENTE, ACEITO, RECUSADO

    @Column(name = "data_envio", nullable = false)
    private LocalDateTime dataEnvio = LocalDateTime.now();

    @Column(name = "data_resposta")
    private LocalDateTime dataResposta;
}

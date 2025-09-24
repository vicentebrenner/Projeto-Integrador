package com.musicMakers.Projeto.domain.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "pagamentos")
@Data
public class Pagamento {

    @Id
    private Integer id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_venda")
    private Venda venda;

    @Column(name = "metodo_pagamento")
    private String metodoPagamento;

    @Column(name = "id_transacao_gateway")
    private String idTransacaoGateway;

    @Column(name = "status_gateway")
    private String statusGateway;
}
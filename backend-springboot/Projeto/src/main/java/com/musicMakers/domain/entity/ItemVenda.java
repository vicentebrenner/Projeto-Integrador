package com.musicMakers.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.musicMakers.domain.entity.pk.ItemVendaPK;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "itens_venda")
@Data
public class ItemVenda {

    @EmbeddedId
    private ItemVendaPK id = new ItemVendaPK();

    @ManyToOne
    @MapsId("venda")
    @JoinColumn(name = "id_venda")
    private Venda venda;

    @ManyToOne
    @MapsId("curso")
    @JoinColumn(name = "id_curso")
    private Curso curso;

    @Column(name = "preco_unitario")
    private BigDecimal precoUnitario;
}
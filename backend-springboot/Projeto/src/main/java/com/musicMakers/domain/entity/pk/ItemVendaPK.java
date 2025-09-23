package com.musicMakers.domain.entity.pk;

import jakarta.persistence.Embeddable;
import lombok.Data;
import java.io.Serializable;

@Embeddable
@Data
public class ItemVendaPK implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer venda;
    private Integer curso;
}
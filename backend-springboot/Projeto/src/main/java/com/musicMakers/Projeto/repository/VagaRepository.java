package com.musicMakers.Projeto.repository;

import com.musicMakers.Projeto.domain.entity.Vaga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VagaRepository extends JpaRepository<Vaga, Long> {

    // Consulta explícita via JPQL (em vez de derivação de nome de método):
    // a entidade Vaga possui um getter derivado getBandaId(), que faz o
    // Spring Data tentar resolver "bandaId" como atributo literal em vez de
    // percorrer o relacionamento "banda.id" quando o nome do método é usado
    // para derivar a query automaticamente.
    @Query("SELECT v FROM Vaga v WHERE v.banda.id = :bandaId")
    List<Vaga> findByBandaId(@Param("bandaId") Long bandaId);

    List<Vaga> findByStatus(String status);
}
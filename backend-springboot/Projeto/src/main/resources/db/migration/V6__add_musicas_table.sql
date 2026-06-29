CREATE TABLE musica (
    id SERIAL PRIMARY KEY,
    banda_id BIGINT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    origem VARCHAR(100),
    partitura_url TEXT,
    CONSTRAINT fk_musica_banda FOREIGN KEY (banda_id) REFERENCES banda(id) ON DELETE CASCADE
);

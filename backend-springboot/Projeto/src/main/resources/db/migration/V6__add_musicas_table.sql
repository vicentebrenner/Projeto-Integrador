-- Corrige a tabela MUSICA criada em V1 (titulo, artista_original, duracao)
-- para a estrutura esperada pela entidade Musica (banda_id, nome, origem, partitura_url).
ALTER TABLE musica
    ADD COLUMN banda_id BIGINT,
    ADD COLUMN nome VARCHAR(255),
    ADD COLUMN origem VARCHAR(100),
    ADD COLUMN partitura_url TEXT;

ALTER TABLE musica DROP COLUMN titulo;
ALTER TABLE musica DROP COLUMN artista_original;
ALTER TABLE musica DROP COLUMN duracao;

ALTER TABLE musica ALTER COLUMN nome SET NOT NULL;
ALTER TABLE musica ALTER COLUMN banda_id SET NOT NULL;
ALTER TABLE musica ADD CONSTRAINT fk_musica_banda FOREIGN KEY (banda_id) REFERENCES banda(id) ON DELETE CASCADE;

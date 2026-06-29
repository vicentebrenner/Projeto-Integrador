-- Adicionando colunas de detalhamento e localização na tabela VAGA
ALTER TABLE vaga
ADD COLUMN quantidade_vagas INT DEFAULT 1,
ADD COLUMN responsabilidades TEXT,
ADD COLUMN requisitos_obrigatorios TEXT,
ADD COLUMN requisitos_desejaveis TEXT,
ADD COLUMN nivel_experiencia VARCHAR(100),
ADD COLUMN data_limite VARCHAR(50),
ADD COLUMN pais VARCHAR(100),
ADD COLUMN estado VARCHAR(100),
ADD COLUMN regiao VARCHAR(100),
ADD COLUMN cidade VARCHAR(150),
ADD COLUMN bairro VARCHAR(150),
ADD COLUMN funcao VARCHAR(150);

-- Adicionando colunas de detalhamento e localização estruturada na tabela PERFIL_MUSICO
ALTER TABLE perfil_musico
ADD COLUMN pais VARCHAR(100),
ADD COLUMN estado VARCHAR(100),
ADD COLUMN regiao VARCHAR(100),
ADD COLUMN cidade VARCHAR(150),
ADD COLUMN bairro VARCHAR(150),
ADD COLUMN funcao VARCHAR(150),
ADD COLUMN ministerios_interesse TEXT,
ADD COLUMN formacao_musical TEXT;

-- Adicionar campo na candidatura para percentual caso queira guardar historico futuro, 
-- mas por hora usaremos em memoria, entao não precisamos alterar candidatura agora.

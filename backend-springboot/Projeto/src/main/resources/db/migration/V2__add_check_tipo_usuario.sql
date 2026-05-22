-- Migration para adicionar restrição de verificação no campo tipo_usuario
ALTER TABLE usuario DROP CONSTRAINT IF EXISTS chk_tipo_usuario;
ALTER TABLE usuario ADD CONSTRAINT chk_tipo_usuario CHECK (tipo_usuario IN ('MUSICO', 'GESTOR', 'CONTRATANTE', 'ADMIN'));

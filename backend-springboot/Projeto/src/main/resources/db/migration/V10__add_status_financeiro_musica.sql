-- Adiciona status de pagamento às transações financeiras (PAGO, PENDENTE)
-- e status de progresso às músicas do repertório (NOVA, EM_ESTUDO, PRONTA).
ALTER TABLE financeiro ADD COLUMN status VARCHAR(20);
UPDATE financeiro SET status = 'PAGO' WHERE status IS NULL;

ALTER TABLE musica ADD COLUMN status VARCHAR(20);
UPDATE musica SET status = 'NOVA' WHERE status IS NULL;

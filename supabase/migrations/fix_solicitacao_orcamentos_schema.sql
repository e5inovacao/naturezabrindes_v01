-- Migração para corrigir o schema da tabela solicitacao_orcamentos
-- Adiciona as colunas necessárias que estão sendo usadas no código

-- Adicionar colunas de dados do cliente
ALTER TABLE solicitacao_orcamentos 
ADD COLUMN IF NOT EXISTS nome_cliente VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_cliente VARCHAR(255),
ADD COLUMN IF NOT EXISTS telefone_cliente VARCHAR(20),
ADD COLUMN IF NOT EXISTS empresa_cliente VARCHAR(255),
ADD COLUMN IF NOT EXISTS cnpj_cliente VARCHAR(20),
ADD COLUMN IF NOT EXISTS endereco_cliente TEXT,
ADD COLUMN IF NOT EXISTS valor_total_estimado DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS numero_solicitacao VARCHAR(50),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendente';

-- Renomear coluna existente para manter compatibilidade
ALTER TABLE solicitacao_orcamentos 
RENAME COLUMN solicitacao_status TO status_old;

-- Atualizar dados existentes se houver
UPDATE solicitacao_orcamentos 
SET status = COALESCE(status_old, 'pendente')
WHERE status IS NULL;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_solicitacao_email_cliente ON solicitacao_orcamentos(email_cliente);
CREATE INDEX IF NOT EXISTS idx_solicitacao_telefone_cliente ON solicitacao_orcamentos(telefone_cliente);
CREATE INDEX IF NOT EXISTS idx_solicitacao_status ON solicitacao_orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_solicitacao_numero ON solicitacao_orcamentos(numero_solicitacao);

-- Comentários para documentação
COMMENT ON COLUMN solicitacao_orcamentos.nome_cliente IS 'Nome completo do cliente';
COMMENT ON COLUMN solicitacao_orcamentos.email_cliente IS 'Email do cliente para contato';
COMMENT ON COLUMN solicitacao_orcamentos.telefone_cliente IS 'Telefone do cliente';
COMMENT ON COLUMN solicitacao_orcamentos.empresa_cliente IS 'Nome da empresa do cliente';
COMMENT ON COLUMN solicitacao_orcamentos.cnpj_cliente IS 'CNPJ da empresa do cliente';
COMMENT ON COLUMN solicitacao_orcamentos.endereco_cliente IS 'Endereço completo do cliente';
COMMENT ON COLUMN solicitacao_orcamentos.valor_total_estimado IS 'Valor total estimado do orçamento';
COMMENT ON COLUMN solicitacao_orcamentos.numero_solicitacao IS 'Número único da solicitação';
COMMENT ON COLUMN solicitacao_orcamentos.status IS 'Status da solicitação (pendente, aprovado, rejeitado, etc.)';

-- Trigger para gerar número da solicitação automaticamente
CREATE OR REPLACE FUNCTION generate_solicitacao_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_solicitacao IS NULL THEN
        NEW.numero_solicitacao := 'SOL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.solicitacao_id::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_generate_solicitacao_number ON solicitacao_orcamentos;
CREATE TRIGGER trigger_generate_solicitacao_number
    BEFORE INSERT ON solicitacao_orcamentos
    FOR EACH ROW
    EXECUTE FUNCTION generate_solicitacao_number();

-- Garantir permissões para as roles
GRANT SELECT, INSERT, UPDATE ON solicitacao_orcamentos TO anon;
GRANT ALL PRIVILEGES ON solicitacao_orcamentos TO authenticated;
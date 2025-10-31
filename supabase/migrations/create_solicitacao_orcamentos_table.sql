-- Criar tabela solicitacao_orcamentos (nome correto usado no código)
CREATE TABLE IF NOT EXISTS solicitacao_orcamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_solicitacao VARCHAR(50) UNIQUE,
    nome_cliente VARCHAR(255) NOT NULL,
    email_cliente VARCHAR(255) NOT NULL,
    telefone_cliente VARCHAR(20),
    empresa_cliente VARCHAR(255),
    cnpj_cliente VARCHAR(18),
    endereco_cliente TEXT,
    observacoes TEXT,
    valor_total_estimado DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovado', 'rejeitado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_solicitacao_orcamentos_numero ON solicitacao_orcamentos(numero_solicitacao);
CREATE INDEX IF NOT EXISTS idx_solicitacao_orcamentos_email ON solicitacao_orcamentos(email_cliente);
CREATE INDEX IF NOT EXISTS idx_solicitacao_orcamentos_status ON solicitacao_orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_solicitacao_orcamentos_created_at ON solicitacao_orcamentos(created_at);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_solicitacao_orcamentos_updated_at
    BEFORE UPDATE ON solicitacao_orcamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para gerar número da solicitação automaticamente
CREATE OR REPLACE FUNCTION generate_solicitacao_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_solicitacao IS NULL THEN
        NEW.numero_solicitacao := 'SOL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_generate_solicitacao_number
    BEFORE INSERT ON solicitacao_orcamentos
    FOR EACH ROW
    EXECUTE FUNCTION generate_solicitacao_number();

-- Habilitar RLS (Row Level Security)
ALTER TABLE solicitacao_orcamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para permitir inserção pública
CREATE POLICY "Permitir inserção pública em solicitacao_orcamentos" ON solicitacao_orcamentos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura pública em solicitacao_orcamentos" ON solicitacao_orcamentos
    FOR SELECT USING (true);

CREATE POLICY "Permitir atualização pública em solicitacao_orcamentos" ON solicitacao_orcamentos
    FOR UPDATE USING (true) WITH CHECK (true);

-- Conceder permissões às roles anon e authenticated
GRANT SELECT, INSERT, UPDATE ON solicitacao_orcamentos TO anon;
GRANT ALL PRIVILEGES ON solicitacao_orcamentos TO authenticated;

-- Conceder permissões para usar as sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comentários para documentação
COMMENT ON TABLE solicitacao_orcamentos IS 'Tabela para armazenar solicitações de orçamento dos clientes';
COMMENT ON COLUMN solicitacao_orcamentos.nome_cliente IS 'Nome completo do cliente';
COMMENT ON COLUMN solicitacao_orcamentos.email_cliente IS 'Email do cliente para contato';
COMMENT ON COLUMN solicitacao_orcamentos.telefone_cliente IS 'Telefone do cliente';
COMMENT ON COLUMN solicitacao_orcamentos.empresa_cliente IS 'Nome da empresa do cliente';
COMMENT ON COLUMN solicitacao_orcamentos.cnpj_cliente IS 'CNPJ da empresa do cliente';
COMMENT ON COLUMN solicitacao_orcamentos.endereco_cliente IS 'Endereço completo do cliente';
COMMENT ON COLUMN solicitacao_orcamentos.valor_total_estimado IS 'Valor total estimado do orçamento';
COMMENT ON COLUMN solicitacao_orcamentos.numero_solicitacao IS 'Número único da solicitação';
COMMENT ON COLUMN solicitacao_orcamentos.status IS 'Status da solicitação (pendente, aprovado, rejeitado, etc.)';
-- Criar tabela products_solicitacao para armazenar produtos das solicitações de orçamento
CREATE TABLE IF NOT EXISTS products_solicitacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    solicitacao_id UUID NOT NULL REFERENCES solicitacao_orcamentos(id) ON DELETE CASCADE,
    product_id INTEGER,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    color VARCHAR(100),
    notes TEXT,
    opcao1 INTEGER DEFAULT 0,
    opcao2 INTEGER DEFAULT 0,
    opcao3 INTEGER DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) DEFAULT 0,
    customizations JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_solicitacao_solicitacao_id ON products_solicitacao(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_products_solicitacao_product_id ON products_solicitacao(product_id);
CREATE INDEX IF NOT EXISTS idx_products_solicitacao_created_at ON products_solicitacao(created_at);

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_products_solicitacao_updated_at
    BEFORE UPDATE ON products_solicitacao
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE products_solicitacao ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para permitir inserção e leitura pública
CREATE POLICY "Permitir inserção pública em products_solicitacao" ON products_solicitacao
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura pública em products_solicitacao" ON products_solicitacao
    FOR SELECT USING (true);

CREATE POLICY "Permitir atualização pública em products_solicitacao" ON products_solicitacao
    FOR UPDATE USING (true);

-- Conceder permissões às roles anon e authenticated
GRANT SELECT, INSERT, UPDATE ON products_solicitacao TO anon;
GRANT SELECT, INSERT, UPDATE ON products_solicitacao TO authenticated;

-- Adicionar comentário para documentação
COMMENT ON TABLE products_solicitacao IS 'Tabela para armazenar produtos das solicitações de orçamento com informações detalhadas';
COMMENT ON COLUMN products_solicitacao.opcao1 IS 'Quantidade para opção 1';
COMMENT ON COLUMN products_solicitacao.opcao2 IS 'Quantidade para opção 2';
COMMENT ON COLUMN products_solicitacao.opcao3 IS 'Quantidade para opção 3';
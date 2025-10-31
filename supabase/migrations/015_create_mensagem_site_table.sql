-- Migration: Create mensagem_site table
-- Description: Create table to store contact form messages from website
-- Date: 2024

-- Create mensagem_site table
CREATE TABLE mensagem_site (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_cliente_id UUID NOT NULL REFERENCES usuarios_clientes(id) ON DELETE CASCADE,
    assunto VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'nova' CHECK (status IN ('nova', 'lida', 'respondida', 'arquivada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_mensagem_site_usuario_cliente_id ON mensagem_site(usuario_cliente_id);
CREATE INDEX idx_mensagem_site_status ON mensagem_site(status);
CREATE INDEX idx_mensagem_site_created_at ON mensagem_site(created_at);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_mensagem_site_updated_at
    BEFORE UPDATE ON mensagem_site
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE mensagem_site ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mensagem_site
CREATE POLICY "Users can view their own messages" ON mensagem_site
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_clientes u 
            WHERE u.id = mensagem_site.usuario_cliente_id 
            AND u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own messages" ON mensagem_site
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios_clientes u 
            WHERE u.id = mensagem_site.usuario_cliente_id 
            AND u.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all messages" ON mensagem_site
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT ON mensagem_site TO anon;
GRANT ALL PRIVILEGES ON mensagem_site TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE mensagem_site IS 'Tabela para armazenar mensagens enviadas através do formulário de contato do site';
COMMENT ON COLUMN mensagem_site.usuario_cliente_id IS 'Referência ao cliente que enviou a mensagem';
COMMENT ON COLUMN mensagem_site.assunto IS 'Assunto da mensagem';
COMMENT ON COLUMN mensagem_site.mensagem IS 'Conteúdo da mensagem';
COMMENT ON COLUMN mensagem_site.status IS 'Status da mensagem (nova, lida, respondida, arquivada)';
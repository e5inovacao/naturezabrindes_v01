-- Adicionar coluna email na tabela usuarios_cliente
-- Esta migração resolve o problema de não conseguir salvar o email dos usuários

ALTER TABLE usuarios_cliente 
ADD COLUMN email VARCHAR(255);

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN usuarios_cliente.email IS 'Email address of the user for contact and identification';

-- Criar índice para melhorar performance de busca por email
CREATE INDEX idx_usuarios_cliente_email ON usuarios_cliente(email);

-- Atualizar trigger de updated_at se necessário
-- (O trigger já existe, não precisa recriar)

-- Verificar permissões para a tabela
GRANT SELECT, INSERT, UPDATE ON usuarios_cliente TO authenticated;
GRANT SELECT ON usuarios_cliente TO anon;
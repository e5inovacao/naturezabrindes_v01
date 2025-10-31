-- Corrigir políticas RLS para permitir inserção de mensagens do site

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Allow anonymous insert" ON usuarios_clientes;
DROP POLICY IF EXISTS "Allow anonymous insert" ON mensagem_site;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON usuarios_clientes;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON mensagem_site;

-- Política para permitir inserção de clientes por usuários anônimos
CREATE POLICY "Allow anonymous insert usuarios_clientes" ON usuarios_clientes
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Política para permitir inserção de clientes por usuários autenticados
CREATE POLICY "Allow authenticated insert usuarios_clientes" ON usuarios_clientes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para permitir seleção de clientes por usuários anônimos (necessário para verificar se cliente já existe)
CREATE POLICY "Allow anonymous select usuarios_clientes" ON usuarios_clientes
    FOR SELECT
    TO anon
    USING (true);

-- Política para permitir seleção de clientes por usuários autenticados
CREATE POLICY "Allow authenticated select usuarios_clientes" ON usuarios_clientes
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para permitir inserção de mensagens por usuários anônimos
CREATE POLICY "Allow anonymous insert mensagem_site" ON mensagem_site
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Política para permitir inserção de mensagens por usuários autenticados
CREATE POLICY "Allow authenticated insert mensagem_site" ON mensagem_site
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Garantir que as tabelas tenham as permissões corretas para os roles
GRANT SELECT, INSERT ON usuarios_clientes TO anon;
GRANT SELECT, INSERT ON usuarios_clientes TO authenticated;
GRANT INSERT ON mensagem_site TO anon;
GRANT INSERT ON mensagem_site TO authenticated;

-- Comentários para documentação
COMMENT ON POLICY "Allow anonymous insert usuarios_clientes" ON usuarios_clientes IS 'Permite que usuários anônimos criem registros de clientes através do formulário de contato';
COMMENT ON POLICY "Allow anonymous insert mensagem_site" ON mensagem_site IS 'Permite que usuários anônimos enviem mensagens através do formulário de contato';
COMMENT ON POLICY "Allow anonymous select usuarios_clientes" ON usuarios_clientes IS 'Permite que usuários anônimos verifiquem se um cliente já existe pelo email';
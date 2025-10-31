-- Verificar e corrigir permissões para as tabelas usuarios_clientes e mensagem_site

-- Garantir que a role anon tenha permissões básicas
GRANT SELECT, INSERT ON usuarios_clientes TO anon;
GRANT SELECT, INSERT ON mensagem_site TO anon;

-- Garantir que a role authenticated tenha permissões completas
GRANT ALL PRIVILEGES ON usuarios_clientes TO authenticated;
GRANT ALL PRIVILEGES ON mensagem_site TO authenticated;

-- Verificar se as políticas RLS estão configuradas corretamente
-- Para usuarios_clientes
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON usuarios_clientes;
CREATE POLICY "Usuários podem inserir seus próprios dados" ON usuarios_clientes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON usuarios_clientes;
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios_clientes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON usuarios_clientes;
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON usuarios_clientes
    FOR UPDATE USING (true);

-- Para mensagem_site
DROP POLICY IF EXISTS "Usuários podem inserir mensagens" ON mensagem_site;
CREATE POLICY "Usuários podem inserir mensagens" ON mensagem_site
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem ver mensagens" ON mensagem_site;
CREATE POLICY "Usuários podem ver mensagens" ON mensagem_site
    FOR SELECT USING (true);

-- Comentário para verificação
COMMENT ON TABLE usuarios_clientes IS 'Permissões atualizadas para permitir inserção de dados';
COMMENT ON TABLE mensagem_site IS 'Permissões atualizadas para permitir inserção de mensagens';
-- Verificar permissões da tabela usuarios_clientes
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'usuarios_clientes' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'usuarios_clientes';

-- Garantir permissões básicas para anon e authenticated
GRANT SELECT, INSERT, UPDATE ON usuarios_clientes TO anon;
GRANT SELECT, INSERT, UPDATE ON usuarios_clientes TO authenticated;

-- Criar política RLS para permitir inserção de novos usuários
DROP POLICY IF EXISTS "Allow insert for new users" ON usuarios_clientes;
CREATE POLICY "Allow insert for new users" 
  ON usuarios_clientes FOR INSERT 
  WITH CHECK (true);

-- Criar política RLS para permitir leitura
DROP POLICY IF EXISTS "Allow read for all" ON usuarios_clientes;
CREATE POLICY "Allow read for all" 
  ON usuarios_clientes FOR SELECT 
  USING (true);

-- Criar política RLS para permitir atualização
DROP POLICY IF EXISTS "Allow update for all" ON usuarios_clientes;
CREATE POLICY "Allow update for all" 
  ON usuarios_clientes FOR UPDATE 
  USING (true);
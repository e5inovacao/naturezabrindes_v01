-- Verificar permissões atuais da tabela usuarios_clientes
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'usuarios_clientes' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Conceder permissões necessárias para a tabela usuarios_clientes
-- Para usuários anônimos (anon) - apenas leitura básica
GRANT SELECT ON usuarios_clientes TO anon;

-- Para usuários autenticados (authenticated) - acesso completo
GRANT ALL PRIVILEGES ON usuarios_clientes TO authenticated;

-- Verificar permissões após a concessão
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'usuarios_clientes' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Comentário: Este script corrige as permissões da tabela usuarios_clientes
-- para garantir que o cadastro de clientes funcione corretamente
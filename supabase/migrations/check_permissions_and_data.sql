-- Verificar permissões na tabela ecologic_products_site
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'ecologic_products_site'
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Testar acesso direto aos dados
SELECT COUNT(*) as total_produtos FROM ecologic_products_site;

-- Verificar primeiros 5 produtos
SELECT id, codigo, titulo, categoria 
FROM ecologic_products_site 
LIMIT 5;

-- Conceder permissões se necessário
GRANT SELECT ON ecologic_products_site TO anon;
GRANT SELECT ON ecologic_products_site TO authenticated;

-- Verificar novamente as permissões após concessão
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'ecologic_products_site'
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;
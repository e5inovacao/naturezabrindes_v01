-- Verificar políticas RLS da tabela usuarios_cliente
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'usuarios_cliente';

-- Verificar permissões da tabela usuarios_cliente
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'usuarios_cliente' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY grantee, privilege_type;
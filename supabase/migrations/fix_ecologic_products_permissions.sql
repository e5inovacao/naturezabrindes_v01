-- Fix permissions for ecologic_products_site table
-- Grant SELECT permission to anon and authenticated roles

-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'ecologic_products_site' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Grant SELECT permission to anon role (for public access)
GRANT SELECT ON ecologic_products_site TO anon;

-- Grant full access to authenticated role (for logged-in users)
GRANT ALL PRIVILEGES ON ecologic_products_site TO authenticated;

-- Verify permissions were granted
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'ecologic_products_site' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;
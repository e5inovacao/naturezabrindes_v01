-- Fix ensure_client_exists function and verify email column exists
-- This migration ensures the function works correctly with the email column

-- Ensure email column exists (safe to run multiple times)
ALTER TABLE usuarios_clientes ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create unique index on email for better performance (safe to run multiple times)
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_clientes_email_idx ON usuarios_clientes(email) WHERE email IS NOT NULL;

-- Drop and recreate the function to ensure it's using the correct schema
DROP FUNCTION IF EXISTS ensure_client_exists(TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION ensure_client_exists(p_email TEXT, p_nome TEXT DEFAULT NULL, p_telefone TEXT DEFAULT NULL, p_empresa TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    client_id UUID;
BEGIN
    -- Try to find existing user by email
    SELECT id INTO client_id
    FROM usuarios_clientes
    WHERE email = p_email;
    
    -- If not found, create new user
    IF client_id IS NULL THEN
        INSERT INTO usuarios_clientes (user_id, nome, email, telefone, empresa)
        VALUES (
            NULL, -- No auth user_id for anonymous quote requests
            COALESCE(p_nome, 'Cliente'),
            p_email,
            p_telefone,
            p_empresa
        )
        RETURNING id INTO client_id;
    END IF;
    
    RETURN client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION ensure_client_exists(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_client_exists(TEXT, TEXT, TEXT, TEXT) TO anon;

-- Verify the function exists
SELECT 'Function ensure_client_exists created successfully' as status;
-- Add email column to usuarios_cliente table
ALTER TABLE usuarios_cliente ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create unique index on email for better performance
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_cliente_email_idx ON usuarios_cliente(email) WHERE email IS NOT NULL;

-- Update the ensure_client_exists function to work with the email column
CREATE OR REPLACE FUNCTION ensure_client_exists(p_email TEXT, p_nome TEXT DEFAULT NULL, p_telefone TEXT DEFAULT NULL, p_empresa TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    client_id UUID;
BEGIN
    -- Try to find existing user by email
    SELECT id INTO client_id
    FROM usuarios_cliente
    WHERE email = p_email;
    
    -- If not found, create new user
    IF client_id IS NULL THEN
        INSERT INTO usuarios_cliente (user_id, nome, email, telefone, empresa)
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
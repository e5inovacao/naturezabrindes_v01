-- Fix quote_number field error in triggers
-- Remove all problematic triggers and functions that reference 'quote_number'

-- Drop all existing triggers that might be causing the issue
DROP TRIGGER IF EXISTS set_quote_number_trigger ON orcamentos_sistema CASCADE;
DROP TRIGGER IF EXISTS generate_quote_number_trigger ON orcamentos_sistema CASCADE;
DROP TRIGGER IF EXISTS set_orcamento_numero ON orcamentos_sistema CASCADE;
DROP TRIGGER IF EXISTS set_simple_quote_number_trigger ON orcamentos_sistema CASCADE;

-- Drop all existing functions that might reference quote_number
DROP FUNCTION IF EXISTS set_quote_number() CASCADE;
DROP FUNCTION IF EXISTS generate_quote_number() CASCADE;
DROP FUNCTION IF EXISTS set_orcamento_numero() CASCADE;
DROP FUNCTION IF EXISTS set_simple_quote_number() CASCADE;
DROP FUNCTION IF EXISTS generate_simple_quote_number() CASCADE;

-- Create a clean function to generate quote numbers
CREATE OR REPLACE FUNCTION generate_orcamento_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    orcamento_number TEXT;
BEGIN
    -- Get the next sequential number
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_orcamento FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO next_number
    FROM orcamentos_sistema
    WHERE numero_orcamento ~ '^ORC[0-9]+$';
    
    -- Format as ORC + padded number
    orcamento_number := 'ORC' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN orcamento_number;
END;
$$ LANGUAGE plpgsql;

-- Create a clean trigger function that only uses numero_orcamento
CREATE OR REPLACE FUNCTION set_orcamento_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set numero_orcamento if it's not already set
    IF NEW.numero_orcamento IS NULL OR NEW.numero_orcamento = '' THEN
        NEW.numero_orcamento := generate_orcamento_number();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER set_orcamento_number_trigger
    BEFORE INSERT ON orcamentos_sistema
    FOR EACH ROW
    EXECUTE FUNCTION set_orcamento_number();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON orcamentos_sistema TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON orcamentos_sistema TO authenticated;

-- Verify the function exists
SELECT 'Trigger set_orcamento_number_trigger created successfully' as status;
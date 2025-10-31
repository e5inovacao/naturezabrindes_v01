-- Verificar os usuários mais recentes na tabela usuarios_clientes
-- para confirmar se o teste inseriu os dados corretamente

SELECT 
    id,
    nome,
    email,
    telefone,
    empresa,
    cnpj,
    endereco,
    created_at,
    updated_at
FROM usuarios_clientes 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar especificamente o usuário de teste mais recente
SELECT 
    id,
    nome,
    email,
    telefone,
    empresa,
    cnpj,
    endereco,
    created_at
FROM usuarios_clientes 
WHERE nome LIKE 'Cliente Teste%'
ORDER BY created_at DESC 
LIMIT 3;

-- Contar total de usuários
SELECT COUNT(*) as total_usuarios FROM usuarios_clientes;
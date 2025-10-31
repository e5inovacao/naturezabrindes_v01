-- Consulta para verificar produtos de canetas
-- Verificar todos os produtos que contenham "caneta" no título ou descrição

SELECT 
    id,
    codigo,
    titulo,
    categoria,
    descricao
FROM ecologic_products_site 
WHERE 
    LOWER(titulo) LIKE '%caneta%' 
    OR LOWER(descricao) LIKE '%caneta%'
    OR LOWER(categoria) LIKE '%caneta%'
ORDER BY titulo
LIMIT 20;

-- Verificar estatísticas gerais
SELECT 
    'Total de produtos' as tipo,
    COUNT(*) as quantidade
FROM ecologic_products_site

UNION ALL

SELECT 
    'Produtos com caneta no título' as tipo,
    COUNT(*) as quantidade
FROM ecologic_products_site
WHERE LOWER(titulo) LIKE '%caneta%'

UNION ALL

SELECT 
    'Produtos com categoria definida' as tipo,
    COUNT(*) as quantidade
FROM ecologic_products_site
WHERE categoria IS NOT NULL AND categoria != ''

UNION ALL

SELECT 
    'Produtos sem categoria' as tipo,
    COUNT(*) as quantidade
FROM ecologic_products_site
WHERE categoria IS NULL OR categoria = '';

-- Verificar categorias existentes
SELECT 
    categoria,
    COUNT(*) as quantidade
FROM ecologic_products_site
WHERE categoria IS NOT NULL AND categoria != ''
GROUP BY categoria
ORDER BY quantidade DESC
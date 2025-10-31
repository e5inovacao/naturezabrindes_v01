-- Verificar produtos com 'caneta' no título
SELECT 
    id,
    codigo,
    titulo,
    categoria,
    descricao
FROM ecologic_products_site 
WHERE 
    LOWER(titulo) LIKE '%caneta%'
ORDER BY titulo
LIMIT 10;

-- Verificar produtos com 'caneca' no título
SELECT 
    id,
    codigo,
    titulo,
    categoria,
    descricao
FROM ecologic_products_site 
WHERE 
    LOWER(titulo) LIKE '%caneca%'
ORDER BY titulo
LIMIT 10;

-- Verificar produtos com 'bolsa' no título
SELECT 
    id,
    codigo,
    titulo,
    categoria,
    descricao
FROM ecologic_products_site 
WHERE 
    LOWER(titulo) LIKE '%bolsa%'
ORDER BY titulo
LIMIT 10;

-- Verificar total de produtos por categoria mais comum
SELECT 
    categoria,
    COUNT(*) as total
FROM ecologic_products_site
WHERE categoria IS NOT NULL AND categoria != ''
GROUP BY categoria
ORDER BY total DESC
LIMIT 20;
-- Consulta para verificar produtos de nécessaires
-- Verificar todos os produtos que contenham "necessaire" no título ou descrição

SELECT 
    id,
    codigo,
    titulo,
    categoria,
    descricao
FROM ecologic_products_site 
WHERE 
    LOWER(titulo) LIKE '%necessaire%' 
    OR LOWER(descricao) LIKE '%necessaire%'
    OR LOWER(titulo) LIKE '%nécessaire%'
    OR LOWER(descricao) LIKE '%nécessaire%'
ORDER BY titulo
LIMIT 20;

-- Verificar produtos que contenham termos relacionados
SELECT 
    id,
    codigo,
    titulo,
    categoria,
    descricao
FROM ecologic_products_site 
WHERE 
    LOWER(titulo) LIKE '%necessaire%' 
    OR LOWER(titulo) LIKE '%estojo%'
    OR LOWER(titulo) LIKE '%kit%'
    OR LOWER(titulo) LIKE '%bolsa%'
    OR LOWER(titulo) LIKE '%porta%'
ORDER BY titulo
LIMIT 30;

-- Contar total de produtos por categoria relacionada
SELECT 
    categoria,
    COUNT(*) as total
FROM ecologic_products_site 
WHERE 
    LOWER(titulo) LIKE '%necessaire%' 
    OR LOWER(titulo) LIKE '%estojo%'
    OR LOWER(titulo) LIKE '%kit%'
GROUP BY categoria
ORDER BY total DESC;
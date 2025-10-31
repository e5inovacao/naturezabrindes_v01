-- Buscar produtos que contenham 'ecobag' no título
SELECT 
    id,
    codigo,
    titulo,
    descricao,
    categoria,
    img_0 as imagem
FROM ecologic_products_site 
WHERE 
    LOWER(titulo) LIKE '%ecobag%'
    OR LOWER(titulo) LIKE '%eco bag%'
    OR LOWER(titulo) LIKE '%eco-bag%'
ORDER BY titulo
LIMIT 20;

-- Contar total de produtos com 'ecobag'
SELECT COUNT(*) as total_ecobags
FROM ecologic_products_site 
WHERE 
    LOWER(titulo) LIKE '%ecobag%'
    OR LOWER(titulo) LIKE '%eco bag%'
    OR LOWER(titulo) LIKE '%eco-bag%';
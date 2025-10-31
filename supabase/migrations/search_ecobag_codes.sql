-- Buscar produtos que contenham os códigos ou partes deles
SELECT codigo, titulo, descricao, categoria
FROM ecologic_products_site 
WHERE codigo LIKE '%92823%' OR codigo LIKE '%92093%' OR codigo LIKE '%92372%' OR codigo LIKE '%92345%' OR codigo LIKE '%92341%'
ORDER BY codigo;

-- Buscar produtos que contenham 'ecobag' ou 'sacola' no título ou descrição
SELECT codigo, titulo, descricao, categoria
FROM ecologic_products_site 
WHERE LOWER(titulo) LIKE '%ecobag%' OR LOWER(titulo) LIKE '%sacola%' 
   OR LOWER(descricao) LIKE '%ecobag%' OR LOWER(descricao) LIKE '%sacola%'
LIMIT 10;

-- Verificar produtos por categoria que podem ser ecobags
SELECT DISTINCT categoria, COUNT(*) as quantidade
FROM ecologic_products_site 
GROUP BY categoria
ORDER BY quantidade DESC;
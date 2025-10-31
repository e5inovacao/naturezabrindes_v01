-- Verificar produtos com 'necessaire' ou termos relacionados
SELECT 
    id,
    codigo,
    titulo,
    descricao,
    categoria
FROM ecologic_products_site 
WHERE 
    LOWER(titulo) LIKE '%necessaire%' 
    OR LOWER(titulo) LIKE '%necessaires%'
    OR LOWER(titulo) LIKE '%estojo%'
    OR LOWER(titulo) LIKE '%kit%'
    OR LOWER(titulo) LIKE '%porta%'
    OR LOWER(descricao) LIKE '%necessaire%'
    OR LOWER(descricao) LIKE '%necessaires%'
    OR LOWER(descricao) LIKE '%estojo%'
ORDER BY titulo;

-- Contar total de produtos encontrados
SELECT COUNT(*) as total_necessaires
FROM ecologic_products_site 
WHERE 
    LOWER(titulo) LIKE '%necessaire%' 
    OR LOWER(titulo) LIKE '%necessaires%'
    OR LOWER(titulo) LIKE '%estojo%'
    OR LOWER(titulo) LIKE '%kit%'
    OR LOWER(titulo) LIKE '%porta%'
    OR LOWER(descricao) LIKE '%necessaire%'
    OR LOWER(descricao) LIKE '%necessaires%'
    OR LOWER(descricao) LIKE '%estojo%';

-- Verificar algumas categorias para entender a estrutura
SELECT DISTINCT categoria, COUNT(*) as quantidade
FROM ecologic_products_site 
WHERE categoria IS NOT NULL
GROUP BY categoria
ORDER BY quantidade DESC
LIMIT 20;
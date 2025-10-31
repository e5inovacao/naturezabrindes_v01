-- Verificar produtos com 'necessaire' no banco de dados

-- 1. Buscar produtos que contenham 'necessaire' no título (case insensitive)
SELECT 
  id,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE LOWER(titulo) LIKE '%necessaire%'
ORDER BY titulo;

-- 2. Contar quantos produtos contêm 'necessaire' no título
SELECT COUNT(*) as total_necessaires
FROM ecologic_products_site 
WHERE LOWER(titulo) LIKE '%necessaire%';

-- 3. Buscar produtos que contenham termos relacionados
SELECT 
  id,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE LOWER(titulo) LIKE '%estojo%' 
   OR LOWER(titulo) LIKE '%kit%'
   OR LOWER(titulo) LIKE '%porta%'
ORDER BY titulo
LIMIT 10;

-- 4. Verificar todas as categorias disponíveis
SELECT DISTINCT categoria, COUNT(*) as quantidade
FROM ecologic_products_site 
GROUP BY categoria
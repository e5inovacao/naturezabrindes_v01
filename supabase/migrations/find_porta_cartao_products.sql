-- Buscar produtos específicos para porta-cartão e carteira
-- Baseado nos nomes das imagens fornecidas

-- 1. Buscar produtos com 'porta' e 'cartão' ou variações
SELECT 
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  (LOWER(titulo) LIKE '%porta%' AND LOWER(titulo) LIKE '%cartao%')
  OR (LOWER(titulo) LIKE '%porta%' AND LOWER(titulo) LIKE '%cartão%')
  OR LOWER(titulo) LIKE '%porta-cartao%'
  OR LOWER(titulo) LIKE '%portacartao%'
ORDER BY titulo;

-- 2. Buscar produtos com 'carteira'
SELECT 
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%carteira%'
ORDER BY titulo;

-- 3. Buscar produtos com 'documento'
SELECT 
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%documento%'
  OR LOWER(descricao) LIKE '%documento%'
ORDER BY titulo;

-- 4. Buscar produtos com 'cortiça' ou 'rpet'
SELECT 
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%cortica%'
  OR LOWER(titulo) LIKE '%cortiça%'
  OR LOWER(titulo) LIKE '%rpet%'
  OR LOWER(descricao) LIKE '%cortica%'
  OR LOWER(descricao) LIKE '%cortiça%'
  OR LOWER(descricao) LIKE '%rpet%'
ORDER BY titulo;

-- 5. Buscar produtos com 'pasta'
SELECT 
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%pasta%'
  OR LOWER(descricao) LIKE '%pasta%'
ORDER BY titulo;

-- 6. Buscar produtos com 'couro' e 'ecológico'
SELECT 
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  (LOWER(titulo) LIKE '%couro%' AND LOWER(titulo) LIKE '%ecologico%')
  OR (LOWER(descricao) LIKE '%couro%' AND LOWER(descricao) LIKE '%ecologico%')
ORDER BY titulo;

-- 7. Busca ampla por termos relacionados
SELECT 
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%porta%'
  OR LOWER(titulo) LIKE '%cartao%'
  OR LOWER(titulo) LIKE '%cartão%'
  OR LOWER(titulo) LIKE '%carteira%'
  OR LOWER(titulo) LIKE '%documento%'
ORDER BY titulo
LIMIT 50;
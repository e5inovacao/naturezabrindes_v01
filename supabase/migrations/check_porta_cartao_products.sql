-- Verificar produtos específicos para Porta-Cartão e Carteira
-- Baseado nas imagens fornecidas pelo usuário

-- 1. Buscar produtos que contenham 'PORTA CARTÃO RPET'
SELECT 
  id,
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%porta%cartao%rpet%'
  OR LOWER(titulo) LIKE '%porta cartao rpet%'
ORDER BY titulo;

-- 2. Buscar produtos que contenham 'PORTA-CARTÃO EM CORTIÇA'
SELECT 
  id,
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%porta%cartao%cortica%'
  OR LOWER(titulo) LIKE '%porta-cartao%cortica%'
ORDER BY titulo;

-- 3. Buscar produtos que contenham 'Pasta porta-documentos A4'
SELECT 
  id,
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%pasta%porta%documento%'
  OR LOWER(titulo) LIKE '%pasta%documento%a4%'
ORDER BY titulo;

-- 4. Buscar produtos que contenham 'CARTEIRA PORTA DOCUMENTO COURO ECOLÓGICO'
SELECT 
  id,
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%carteira%porta%documento%'
  OR LOWER(titulo) LIKE '%carteira%couro%ecologico%'
ORDER BY titulo;

-- 5. Busca mais ampla por termos relacionados
SELECT 
  id,
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%porta%cartao%'
  OR LOWER(titulo) LIKE '%porta-cartao%'
  OR LOWER(titulo) LIKE '%carteira%'
  OR LOWER(titulo) LIKE '%documento%'
  OR LOWER(titulo) LIKE '%cortica%'
  OR LOWER(titulo) LIKE '%rpet%'
ORDER BY titulo
LIMIT 20;

-- 6. Contar total de produtos relacionados
SELECT COUNT(*) as total_produtos_relacionados
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%porta%cartao%'
  OR LOWER(titulo) LIKE '%porta-cartao%'
  OR LOWER(titulo) LIKE '%carteira%'
  OR LOWER(titulo) LIKE '%documento%';
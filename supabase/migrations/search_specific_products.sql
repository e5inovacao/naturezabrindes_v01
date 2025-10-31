-- Buscar produtos específicos das imagens fornecidas
-- Consulta mais direcionada para encontrar os produtos exatos

-- Busca geral por produtos relacionados a porta-cartão e carteira
SELECT 
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
  OR LOWER(descricao) LIKE '%porta%cartao%'
  OR LOWER(descricao) LIKE '%porta-cartao%'
  OR LOWER(descricao) LIKE '%carteira%'
  OR LOWER(descricao) LIKE '%documento%'
ORDER BY titulo;

-- Busca por termos específicos das imagens
SELECT 
  codigo,
  titulo,
  descricao,
  categoria
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%rpet%'
  OR LOWER(titulo) LIKE '%cortica%'
  OR LOWER(titulo) LIKE '%pasta%'
  OR LOWER(titulo) LIKE '%couro%ecologico%'
  OR LOWER(descricao) LIKE '%rpet%'
  OR LOWER(descricao) LIKE '%cortica%'
  OR LOWER(descricao) LIKE '%pasta%'
  OR LOWER(descricao) LIKE '%couro%ecologico%'
ORDER BY titulo;

-- Verificar todos os produtos para entender melhor os nomes
SELECT 
  codigo,
  titulo,
  categoria
FROM ecologic_products_site 
WHERE titulo IS NOT NULL
ORDER BY titulo
LIMIT 50;
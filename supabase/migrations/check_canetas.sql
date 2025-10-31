-- Consulta para verificar produtos de canetas
SELECT 
  id,
  titulo,
  categoria,
  tipo,
  codigo
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%caneta%' 
  OR LOWER(descricao) LIKE '%caneta%'
  OR LOWER(categoria) LIKE '%caneta%'
  OR LOWER(tipo) LIKE '%caneta%'
ORDER BY titulo;

-- Verificar todas as categorias disponíveis
SELECT DISTINCT categoria, COUNT(*) as total
FROM ecologic_products_site 
WHERE categoria IS NOT NULL
GROUP BY categoria
ORDER BY categoria;

-- Verificar produtos que podem ser papelaria
SELECT 
  id,
  titulo,
  categoria,
  tipo
FROM ecologic_products_site 
WHERE 
  LOWER(titulo) LIKE '%papel%' 
  OR LOWER(titulo) LIKE '%escrit%'
  OR LOWER(titulo) LIKE '%bloco%'
  OR LOWER(titulo) LIKE '%caderno%'
  OR LOWER(categoria) LIKE '%papel%'
ORDER BY titulo
LIMIT 20;
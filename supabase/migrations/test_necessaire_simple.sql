-- Teste simples para verificar produtos com necessaire

-- Buscar todos os produtos que contenham 'necessaire' (case insensitive)
SELECT 
  id,
  titulo,
  categoria,
  CASE 
    WHEN LOWER(titulo) LIKE '%necessaire%' THEN 'SIM'
    ELSE 'NÃO'
  END as contem_necessaire
FROM ecologic_products_site 
WHERE LOWER(titulo) LIKE '%necessaire%'
ORDER BY titulo;

-- Contar total
SELECT 
  COUNT(*) as total_produtos_necessaire
FROM ecologic_products_site 
WHERE LOWER(titulo) LIKE '%necessaire%';

-- Verificar se há produtos com termos similares
SELECT 
  COUNT(*) as total_estojo,
  'estojo' as termo
FROM ecologic_products_site 
WHERE LOWER(titulo) LIKE '%estojo%'

UNION ALL

SELECT 
  COUNT(*) as total_kit,
  'kit' as termo
FROM ecologic_products_site 
WHERE LOWER(titulo) LIKE '%kit%'

UNION ALL

SELECT 
  COUNT(*) as total_porta,
  'porta' as termo
FROM ecologic_products_site 
WHERE LOWER(titulo) LIKE '%porta%';

-- Mostrar alguns exemplos de produtos
SELECT 
  titulo,
  categoria
FROM ecologic_products_site 
LIMIT 20;
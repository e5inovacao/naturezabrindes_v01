-- Verificar se o código 92823 existe na tabela ecologic_products_site
SELECT codigo, titulo, descricao, categoria, img_0 
FROM ecologic_products_site 
WHERE codigo = '92823';

-- Verificar códigos similares
SELECT codigo, titulo, descricao, categoria 
FROM ecologic_products_site 
WHERE codigo LIKE '%92823%' OR codigo LIKE '92823%' OR codigo LIKE '%92823';

-- Verificar todos os códigos que começam com 928
SELECT codigo, titulo, descricao, categoria 
FROM ecologic_products_site 
WHERE codigo LIKE '928%'
ORDER BY codigo;

-- Contar total de produtos na tabela
SELECT COUNT(*) as total_produtos FROM ecologic_products_site;
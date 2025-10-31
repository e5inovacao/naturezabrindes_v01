-- Verificar se os produtos com códigos específicos existem na tabela
SELECT codigo, titulo, descricao, categoria, img_0
FROM ecologic_products_site 
WHERE codigo IN ('92823', '92093', '92372', '92345', '92341')
ORDER BY codigo;

-- Verificar quantos produtos existem na tabela
SELECT COUNT(*) as total_produtos FROM ecologic_products_site;

-- Verificar alguns produtos de exemplo
SELECT codigo, titulo, categoria 
FROM ecologic_products_site 
LIMIT 10;
-- Consulta para verificar todos os produtos que contêm 'agenda' no título
SELECT 
    id,
    codigo,
    titulo,
    descricao,
    categoria,
    tipo
FROM ecologic_products_site 
WHERE LOWER(titulo) LIKE '%agenda%'
ORDER BY titulo;

-- Contagem total de produtos com 'agenda' no título
SELECT COUNT(*) as total_agendas
FROM ecologic_products_site 
WHERE LOWER(titulo) LIKE '%agenda%';
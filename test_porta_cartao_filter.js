// Teste para verificar se o filtro de Porta-Cartão e Carteira está funcionando
import fetch from 'node-fetch';

async function testPortaCartaoFilter() {
  console.log('🔍 Testando filtro Porta-Cartão e Carteira...');
  
  try {
    // 1. Buscar todos os produtos da API
    console.log('\n📡 Buscando todos os produtos da API...');
    const response = await fetch('http://localhost:5175/api/products?limit=100');
    
    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }
    
    const data = await response.json();
    const products = data.data?.items || data.products || data.items || data;
    
    console.log(`📊 Total de produtos encontrados: ${products.length}`);
    
    // 2. Aplicar a mesma lógica de filtragem do frontend
    console.log('\n🔍 Aplicando filtro Porta-Cartão e Carteira...');
    
    const normalizeText = (text) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    const filteredProducts = products.filter(product => {
      const productName = normalizeText(product.name || product.titulo || '');
      const productDesc = normalizeText(product.description || product.descricao || '');
      
      // Verificar se contém os termos desejados baseados nas imagens
      const hasDocumento = productName.includes('documento') || productDesc.includes('documento');
      const hasPortaCartao = productName.includes('porta-cartao') || productName.includes('porta cartao') || 
                            productName.includes('portacartao') || productDesc.includes('porta-cartao') || 
                            productDesc.includes('porta cartao') || productDesc.includes('portacartao');
      const hasCarteira = productName.includes('carteira') || productDesc.includes('carteira');
      
      // Termos específicos das imagens fornecidas
      const hasRpet = productName.includes('rpet') || productDesc.includes('rpet');
      const hasCortica = productName.includes('cortica') || productName.includes('cortiça') || 
                        productDesc.includes('cortica') || productDesc.includes('cortiça');
      const hasPasta = productName.includes('pasta') || productDesc.includes('pasta');
      const hasCouroEcologico = (productName.includes('couro') && productName.includes('ecologico')) || 
                               (productDesc.includes('couro') && productDesc.includes('ecologico'));
      
      // Termos adicionais para capturar variações
      const hasPorta = productName.includes('porta') || productDesc.includes('porta');
      const hasCartao = productName.includes('cartao') || productName.includes('cartão') || 
                       productDesc.includes('cartao') || productDesc.includes('cartão');
      
      const matchesFilter = hasDocumento || hasPortaCartao || hasCarteira || hasRpet || 
                           hasCortica || hasPasta || hasCouroEcologico || 
                           (hasPorta && hasCartao);
      
      if (matchesFilter) {
        console.log('✅ Produto encontrado:', {
          nome: product.name || product.titulo,
          codigo: product.codigo || product.id,
          hasDocumento,
          hasPortaCartao,
          hasCarteira,
          hasRpet,
          hasCortica,
          hasPasta,
          hasCouroEcologico,
          hasPorta: hasPorta && hasCartao ? `${hasPorta} + ${hasCartao}` : false
        });
      }
      
      return matchesFilter;
    });
    
    console.log(`\n📊 Produtos filtrados: ${filteredProducts.length}`);
    
    if (filteredProducts.length > 0) {
      console.log('\n📋 Lista de produtos encontrados:');
      filteredProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name || product.titulo} (${product.codigo || product.id})`);
      });
    } else {
      console.log('\n❌ Nenhum produto encontrado com os critérios de filtro!');
      
      // Vamos fazer uma busca mais ampla para debug
      console.log('\n🔍 Fazendo busca mais ampla para debug...');
      const debugProducts = products.filter(product => {
        const productName = normalizeText(product.name || product.titulo || '');
        const productDesc = normalizeText(product.description || product.descricao || '');
        
        return productName.includes('porta') || productName.includes('cartao') || 
               productName.includes('carteira') || productName.includes('documento') ||
               productName.includes('rpet') || productName.includes('cortica') ||
               productName.includes('pasta') || productName.includes('couro');
      });
      
      console.log(`📊 Produtos com termos relacionados: ${debugProducts.length}`);
      debugProducts.slice(0, 10).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name || product.titulo}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar filtro:', error.message);
  }
}

// Executar o teste
testPortaCartaoFilter();
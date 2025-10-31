// Teste para verificar produtos no banco de dados
import fetch from 'node-fetch';

async function testDatabaseProducts() {
  console.log('🔍 Verificando produtos no banco de dados...');
  
  try {
    // Buscar todos os produtos
    const response = await fetch('http://localhost:5175/api/products');
    const data = await response.json();
    
    console.log('📋 Estrutura da resposta:', typeof data);
    console.log('📋 Chaves da resposta:', Object.keys(data));
    
    // A API retorna um objeto com data
    const products = data.data || data.products || [];
    
    if (!Array.isArray(products)) {
      console.log('❌ Produtos não é um array:', products);
      return;
    }
    
    console.log(`📊 Total de produtos no banco: ${products.length}`);
    
    // Função para normalizar texto
    const normalizeText = (text) => {
      if (!text) return '';
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    // Buscar produtos que contenham termos relacionados a porta-cartão
    const portaCartaoProducts = products.filter(product => {
      const productName = normalizeText(product.name || product.titulo);
      const productDesc = normalizeText(product.description || product.descricao || '');
      
      // Termos específicos das imagens
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
      
      return matchesFilter;
    });
    
    console.log('\n🎯 Produtos encontrados para "Porta-Cartão e Carteira":');
    console.log(`📊 Total: ${portaCartaoProducts.length}`);
    
    portaCartaoProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name || product.titulo}`);
      console.log(`   Código: ${product.codigo || product.id}`);
      console.log(`   Descrição: ${(product.description || product.descricao || '').substring(0, 100)}...`);
      console.log(`   Categoria: ${product.categoria || 'N/A'}`);
    });
    
    // Buscar produtos que contenham apenas 'porta'
    const portaProducts = products.filter(product => {
      const productName = normalizeText(product.name || product.titulo);
      return productName.includes('porta');
    });
    
    console.log('\n🔍 Produtos que contêm "porta":');
    console.log(`📊 Total: ${portaProducts.length}`);
    portaProducts.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || product.titulo}`);
    });
    
    // Buscar produtos que contenham 'cartão' ou 'cartao'
    const cartaoProducts = products.filter(product => {
      const productName = normalizeText(product.name || product.titulo);
      return productName.includes('cartao') || productName.includes('cartão');
    });
    
    console.log('\n💳 Produtos que contêm "cartão/cartao":');
    console.log(`📊 Total: ${cartaoProducts.length}`);
    cartaoProducts.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || product.titulo}`);
    });
    
    // Buscar produtos que contenham 'carteira'
    const carteiraProducts = products.filter(product => {
      const productName = normalizeText(product.name || product.titulo);
      return productName.includes('carteira');
    });
    
    console.log('\n👛 Produtos que contêm "carteira":');
    console.log(`📊 Total: ${carteiraProducts.length}`);
    carteiraProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || product.titulo}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error.message);
  }
}

testDatabaseProducts();
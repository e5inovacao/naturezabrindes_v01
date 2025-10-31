// Buscar todos os produtos para encontrar os específicos das imagens
import fetch from 'node-fetch';

async function searchAllProducts() {
  console.log('🔍 Buscando TODOS os produtos da API...');
  
  try {
    // Buscar com limite maior
    const response = await fetch('http://localhost:5175/api/products?limit=1000');
    
    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }
    
    const data = await response.json();
    const products = data.data?.items || data.products || data.items || data;
    
    console.log(`📊 Total de produtos encontrados: ${products.length}`);
    
    const normalizeText = (text) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    // Buscar produtos que contenham "porta" e "cartao" ou "carteira"
    console.log('\n🔍 Produtos com "porta" + "cartao" ou "carteira":');
    const portaCartaoProducts = products.filter(product => {
      const productName = normalizeText(product.name || product.titulo || '');
      const productDesc = normalizeText(product.description || product.descricao || '');
      
      const hasPorta = productName.includes('porta') || productDesc.includes('porta');
      const hasCartao = productName.includes('cartao') || productName.includes('cartão') || 
                       productDesc.includes('cartao') || productDesc.includes('cartão');
      const hasCarteira = productName.includes('carteira') || productDesc.includes('carteira');
      
      return hasPorta && (hasCartao || hasCarteira);
    });
    
    console.log(`Encontrados: ${portaCartaoProducts.length}`);
    portaCartaoProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || product.titulo} (${product.codigo || product.id})`);
    });
    
    // Buscar produtos com "documento"
    console.log('\n🔍 Produtos com "documento":');
    const documentoProducts = products.filter(product => {
      const productName = normalizeText(product.name || product.titulo || '');
      const productDesc = normalizeText(product.description || product.descricao || '');
      
      return productName.includes('documento') || productDesc.includes('documento');
    });
    
    console.log(`Encontrados: ${documentoProducts.length}`);
    documentoProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || product.titulo} (${product.codigo || product.id})`);
    });
    
    // Buscar produtos com "pasta" + "documento"
    console.log('\n🔍 Produtos com "pasta" + "documento":');
    const pastaDocumentoProducts = products.filter(product => {
      const productName = normalizeText(product.name || product.titulo || '');
      const productDesc = normalizeText(product.description || product.descricao || '');
      
      const hasPasta = productName.includes('pasta') || productDesc.includes('pasta');
      const hasDocumento = productName.includes('documento') || productDesc.includes('documento');
      
      return hasPasta && hasDocumento;
    });
    
    console.log(`Encontrados: ${pastaDocumentoProducts.length}`);
    pastaDocumentoProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || product.titulo} (${product.codigo || product.id})`);
    });
    
    // Buscar produtos com "couro" + "ecologico"
    console.log('\n🔍 Produtos com "couro" + "ecologico":');
    const couroEcologicoProducts = products.filter(product => {
      const productName = normalizeText(product.name || product.titulo || '');
      const productDesc = normalizeText(product.description || product.descricao || '');
      
      const hasCouro = productName.includes('couro') || productDesc.includes('couro');
      const hasEcologico = productName.includes('ecologico') || productDesc.includes('ecologico');
      
      return hasCouro && hasEcologico;
    });
    
    console.log(`Encontrados: ${couroEcologicoProducts.length}`);
    couroEcologicoProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || product.titulo} (${product.codigo || product.id})`);
    });
    
    // Listar alguns produtos aleatórios para ver a estrutura
    console.log('\n📋 Amostra de produtos (primeiros 10):');
    products.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. "${product.name || product.titulo}" (${product.codigo || product.id})`);
      if (product.description || product.descricao) {
        console.log(`   Descrição: ${(product.description || product.descricao).substring(0, 100)}...`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error.message);
  }
}

// Executar a busca
searchAllProducts();
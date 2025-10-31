import fetch from 'node-fetch';

async function testBroaderSearch() {
  const baseUrl = 'http://localhost:5175/api/products';
  
  // Termos mais amplos baseados na imagem
  const searchTerms = [
    'pasta',
    'documento', 
    'couro',
    'ecologico',
    'reciclado',
    'rpet',
    'cortica',
    'papel',
    'A4'
  ];
  
  console.log('🔍 Testando busca mais ampla por produtos...');
  
  for (const term of searchTerms) {
    try {
      console.log(`\n🔍 Buscando produtos com "${term}"...`);
      const response = await fetch(`${baseUrl}?search=${encodeURIComponent(term)}`);
      const data = await response.json();
      
      console.log('Estrutura da resposta:', Object.keys(data));
      
      let products = [];
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          products = data.data;
        } else if (data.data.products && Array.isArray(data.data.products)) {
          products = data.data.products;
        } else if (data.data.data && Array.isArray(data.data.data)) {
          products = data.data.data;
        }
      }
      
      if (products.length > 0) {
        console.log(`✅ Encontrados ${products.length} produtos para "${term}":`);
        products.slice(0, 5).forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name || product.titulo}`);
          if (product.description || product.descricao) {
            console.log(`     Descrição: ${(product.description || product.descricao).substring(0, 100)}...`);
          }
        });
      } else {
        console.log(`❌ Nenhum produto encontrado para "${term}"`);
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar "${term}":`, error.message);
    }
  }
}

testBroaderSearch();
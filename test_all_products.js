import fetch from 'node-fetch';

async function testAllProducts() {
  const baseUrl = 'http://localhost:5175/api/products';
  
  try {
    console.log('🔍 Buscando TODOS os produtos disponíveis...');
    const response = await fetch(baseUrl);
    const data = await response.json();
    
    console.log('Estrutura da resposta:', Object.keys(data));
    console.log('Resposta completa:', JSON.stringify(data, null, 2));
    
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
    
    console.log(`\n📊 Total de produtos encontrados: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\n📋 Primeiros 10 produtos:');
      products.slice(0, 10).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name || product.titulo}`);
        if (product.description || product.descricao) {
          console.log(`     Descrição: ${(product.description || product.descricao).substring(0, 100)}...`);
        }
        if (product.category || product.categoria) {
          console.log(`     Categoria: ${product.category || product.categoria}`);
        }
      });
      
      // Verificar se há produtos que possam ser relacionados aos da imagem
      console.log('\n🔍 Procurando produtos relacionados aos da imagem...');
      const relatedTerms = ['pasta', 'documento', 'couro', 'ecologico', 'reciclado', 'rpet', 'cortica', 'papel', 'A4', 'porta', 'cartao', 'carteira'];
      
      const relatedProducts = products.filter(product => {
        const text = `${product.name || product.titulo} ${product.description || product.descricao || ''} ${product.category || product.categoria || ''}`.toLowerCase();
        return relatedTerms.some(term => text.includes(term.toLowerCase()));
      });
      
      if (relatedProducts.length > 0) {
        console.log(`\n✅ Encontrados ${relatedProducts.length} produtos relacionados:`);
        relatedProducts.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name || product.titulo}`);
        });
      } else {
        console.log('\n❌ Nenhum produto relacionado encontrado');
      }
    } else {
      console.log('❌ Nenhum produto encontrado no banco de dados');
    }
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error.message);
  }
}

testAllProducts();
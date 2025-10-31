// Teste específico para os produtos das imagens
import fetch from 'node-fetch';

async function testSpecificProducts() {
  console.log('🔍 Buscando produtos específicos das imagens...');
  
  // Produtos que devem aparecer baseados nas imagens
  const targetProducts = [
    'PORTA CARTÃO RPET',
    'PORTA-CARTÃO EM CORTIÇA', 
    'Pasta porta-documentos A4',
    'CARTEIRA PORTA DOCUMENTO COURO ECOLÓGICO'
  ];
  
  try {
    console.log('\n📡 Buscando todos os produtos da API...');
    const response = await fetch('http://localhost:5175/api/products?limit=200');
    
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
    
    console.log('\n🎯 Procurando produtos específicos das imagens...');
    
    // Buscar cada produto específico
    targetProducts.forEach(targetProduct => {
      console.log(`\n🔍 Buscando: "${targetProduct}"`);
      const normalizedTarget = normalizeText(targetProduct);
      
      const matches = products.filter(product => {
        const productName = normalizeText(product.name || product.titulo || '');
        const productDesc = normalizeText(product.description || product.descricao || '');
        
        // Busca exata
        if (productName.includes(normalizedTarget) || productDesc.includes(normalizedTarget)) {
          return true;
        }
        
        // Busca por palavras-chave específicas
        if (targetProduct.includes('RPET')) {
          return (productName.includes('porta') && productName.includes('cartao') && productName.includes('rpet')) ||
                 (productDesc.includes('porta') && productDesc.includes('cartao') && productDesc.includes('rpet'));
        }
        
        if (targetProduct.includes('CORTIÇA')) {
          return (productName.includes('porta') && productName.includes('cartao') && productName.includes('cortica')) ||
                 (productDesc.includes('porta') && productDesc.includes('cartao') && productDesc.includes('cortica'));
        }
        
        if (targetProduct.includes('Pasta')) {
          return (productName.includes('pasta') && productName.includes('porta') && productName.includes('documento')) ||
                 (productDesc.includes('pasta') && productDesc.includes('porta') && productDesc.includes('documento'));
        }
        
        if (targetProduct.includes('CARTEIRA')) {
          return (productName.includes('carteira') && productName.includes('porta') && productName.includes('documento')) ||
                 (productDesc.includes('carteira') && productDesc.includes('porta') && productDesc.includes('documento'));
        }
        
        return false;
      });
      
      if (matches.length > 0) {
        console.log(`✅ Encontrados ${matches.length} produto(s):`);
        matches.forEach(match => {
          console.log(`   - ${match.name || match.titulo} (${match.codigo || match.id})`);
        });
      } else {
        console.log('❌ Nenhum produto encontrado');
      }
    });
    
    // Busca mais ampla por termos relacionados
    console.log('\n🔍 Busca ampla por termos relacionados...');
    
    const relatedTerms = ['porta cartao', 'porta-cartao', 'carteira', 'documento', 'rpet', 'cortica', 'pasta'];
    
    relatedTerms.forEach(term => {
      const matches = products.filter(product => {
        const productName = normalizeText(product.name || product.titulo || '');
        const productDesc = normalizeText(product.description || product.descricao || '');
        
        return productName.includes(normalizeText(term)) || productDesc.includes(normalizeText(term));
      });
      
      if (matches.length > 0) {
        console.log(`\n📋 Produtos com "${term}" (${matches.length} encontrados):`);
        matches.slice(0, 5).forEach(match => {
          console.log(`   - ${match.name || match.titulo}`);
        });
        if (matches.length > 5) {
          console.log(`   ... e mais ${matches.length - 5} produtos`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error.message);
  }
}

// Executar o teste
testSpecificProducts();
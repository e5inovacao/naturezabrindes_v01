// Teste para verificar se o botão 'Bolsas' está funcionando corretamente
// Deve buscar produtos que contenham 'bolsa' no nome ou descrição

const API_BASE_URL = 'http://localhost:3005/api';

async function testBolsasButton() {
  console.log('🧪 Testando funcionalidade do botão "Bolsas"');
  console.log('📋 Deve buscar produtos equivalente a: /catalogo?search=bolsa');
  console.log('=' .repeat(60));
  
  try {
    // Buscar todos os produtos
    console.log('🔍 Buscando todos os produtos...');
    const response = await fetch(`${API_BASE_URL}/products?limit=1000`);
    const data = await response.json();
    
    if (!data.success || !data.products) {
      throw new Error('Erro ao buscar produtos da API');
    }
    
    const allProducts = data.products;
    console.log(`✅ Total de produtos encontrados: ${allProducts.length}`);
    
    // Função para normalizar texto (mesma do frontend)
    function normalizeText(text) {
      if (!text || typeof text !== 'string') return '';
      return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Filtrar produtos que contêm 'bolsa' (lógica do botão 'Bolsas')
    console.log('\n🔍 Filtrando produtos que contêm "bolsa"...');
    const bolsaProducts = allProducts.filter(product => {
      const productName = normalizeText(product.name);
      const productDesc = normalizeText(product.description || '');
      const hasBolsa = productName.includes('bolsa') || productDesc.includes('bolsa');
      
      if (hasBolsa) {
        console.log(`✅ Produto encontrado: ${product.name}`);
      }
      
      return hasBolsa;
    });
    
    console.log('\n📊 RESULTADOS:');
    console.log(`🎯 Total de produtos com "bolsa": ${bolsaProducts.length}`);
    
    if (bolsaProducts.length > 0) {
      console.log('\n📋 Lista de produtos encontrados:');
      bolsaProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
      });
      
      // Verificar se inclui bolsas térmicas
      const termicProducts = bolsaProducts.filter(product => {
        const productName = normalizeText(product.name);
        return productName.includes('termica') || productName.includes('térmica');
      });
      
      console.log(`\n🌡️ Produtos térmicos incluídos: ${termicProducts.length}`);
      if (termicProducts.length > 0) {
        console.log('✅ Confirmado: Bolsas térmicas estão incluídas na busca');
        termicProducts.forEach(product => {
          console.log(`  - ${product.name}`);
        });
      }
    } else {
      console.log('❌ Nenhum produto com "bolsa" foi encontrado');
    }
    
    console.log('\n🏁 Teste do botão "Bolsas" concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar o teste
testBolsasButton().catch(console.error);
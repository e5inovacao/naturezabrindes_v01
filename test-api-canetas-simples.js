import axios from 'axios';

async function testCanetasAPI() {
  try {
    console.log('=== TESTE SIMPLES: API de Canetas ===\n');
    
    // Testar API com filtro de categoria 'Canetas'
    console.log('Testando API /products com categoria=Canetas...');
    const response = await axios.get('http://localhost:3005/api/products?category=Canetas&limit=10');
    
    console.log('Status:', response.status);
    console.log('Estrutura da resposta:', {
      success: response.data.success,
      hasData: !!response.data.data,
      hasItems: !!response.data.data?.items,
      itemsLength: response.data.data?.items?.length || 0
    });
    
    if (response.data.data?.items && response.data.data.items.length > 0) {
      console.log('\n✅ SUCESSO! Produtos de canetas encontrados:', response.data.data.items.length);
      console.log('\nPrimeiros 3 produtos:');
      response.data.data.items.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
      });
    } else {
      console.log('\n❌ PROBLEMA: Nenhum produto de caneta encontrado na API');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testCanetasAPI();
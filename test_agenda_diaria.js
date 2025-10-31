// Teste específico para buscar produtos com 'AGENDA DIÁRIA'
import fetch from 'node-fetch';

async function testAgendaDiariaProducts() {
  try {
    console.log('🔍 Testando busca por "AGENDA DIÁRIA"...');
    
    // Fazer requisição para a API com busca específica
    const response = await fetch('http://localhost:3005/api/products?search=AGENDA DIÁRIA&limit=100');
    const data = await response.json();
    
    console.log('📊 Resposta da API:', {
      success: data.success,
      totalItems: data.data?.pagination?.totalItems || 0,
      currentPage: data.data?.pagination?.currentPage || 0,
      totalPages: data.data?.pagination?.totalPages || 0,
      itemsReturned: data.data?.items?.length || 0
    });
    
    if (data.success && data.data?.items) {
      const agendaDiariaProducts = data.data.items.filter(product => 
        product.name.toLowerCase().includes('agenda diária') ||
        product.name.toLowerCase().includes('agenda diaria')
      );
      
      console.log(`📋 Produtos com 'AGENDA DIÁRIA' encontrados: ${agendaDiariaProducts.length}`);
      
      if (agendaDiariaProducts.length > 0) {
        console.log('\n📝 Lista de produtos "AGENDA DIÁRIA":');
        agendaDiariaProducts.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
        });
      } else {
        console.log('❌ Nenhum produto "AGENDA DIÁRIA" encontrado na busca');
        
        // Listar todos os produtos retornados para debug
        console.log('\n🔍 Todos os produtos retornados na busca:');
        data.data.items.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
        });
      }
    } else {
      console.log('❌ Erro na resposta da API:', data);
    }
    
    // Teste adicional: buscar sem filtro para ver se aparecem em outras páginas
    console.log('\n🔍 Testando busca sem filtro (primeira página)...');
    const responseAll = await fetch('http://localhost:3005/api/products?limit=100&page=1');
    const dataAll = await responseAll.json();
    
    if (dataAll.success && dataAll.data?.items) {
      const allAgendaDiaria = dataAll.data.items.filter(product => 
        product.name.toLowerCase().includes('agenda diária') ||
        product.name.toLowerCase().includes('agenda diaria')
      );
      
      console.log(`📋 Produtos 'AGENDA DIÁRIA' na primeira página (sem filtro): ${allAgendaDiaria.length}`);
      
      if (allAgendaDiaria.length > 0) {
        console.log('\n📝 Produtos encontrados na primeira página:');
        allAgendaDiaria.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar busca por AGENDA DIÁRIA:', error.message);
  }
}

testAgendaDiariaProducts();
// Teste para verificar quantos produtos com 'agenda' a API retorna
import fetch from 'node-fetch';

async function testAgendaProducts() {
  try {
    console.log('🔍 Testando API de produtos...');
    
    // Fazer requisição para a API local (backend) - testando com limite maior
    const response = await fetch('http://localhost:3005/api/products?limit=2000');
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Erro na API:', data.error);
      return;
    }
    
    const products = data.data.items;
    console.log(`📊 Total de produtos retornados pela API: ${products.length}`);
    
    // Filtrar produtos que contêm 'agenda' no nome (case-insensitive)
    const agendaProducts = products.filter(product => 
      product.name.toLowerCase().includes('agenda')
    );
    
    console.log(`📋 Produtos com 'agenda' encontrados: ${agendaProducts.length}`);
    
    // Listar os produtos encontrados
    if (agendaProducts.length > 0) {
      console.log('\n📝 Lista de produtos com "agenda":');
      agendaProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
      });
    } else {
      console.log('⚠️  Nenhum produto com "agenda" foi encontrado!');
    }
    
    // Verificar se há produtos que começam com 'AGENDA'
    const agendaUpperProducts = products.filter(product => 
      product.name.toUpperCase().includes('AGENDA')
    );
    
    console.log(`\n🔤 Produtos com 'AGENDA' (maiúscula): ${agendaUpperProducts.length}`);
    
    if (agendaUpperProducts.length > 0) {
      console.log('\n📝 Lista de produtos com "AGENDA" (maiúscula):');
      agendaUpperProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

// Executar o teste
testAgendaProducts();
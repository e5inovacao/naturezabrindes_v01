// Script para buscar agendas em todas as páginas da API
const { default: fetch } = require('node-fetch');

async function debugAllPagesAgenda() {
  try {
    console.log('🔍 BUSCANDO AGENDAS EM TODAS AS PÁGINAS');
    console.log('=' .repeat(50));
    
    let allProducts = [];
    let currentPage = 1;
    let totalPages = 1;
    
    // Buscar todas as páginas
    do {
      console.log(`\n📄 Buscando página ${currentPage}...`);
      const response = await fetch(`http://localhost:3005/api/products?page=${currentPage}&limit=100&sort=featured`);
      const data = await response.json();
      
      if (!data.success) {
        console.error('❌ Erro na API:', data.error);
        break;
      }
      
      allProducts = allProducts.concat(data.data.items);
      totalPages = data.data.pagination.totalPages;
      console.log(`   ✅ ${data.data.items.length} produtos encontrados nesta página`);
      
      currentPage++;
    } while (currentPage <= totalPages);
    
    console.log(`\n📊 RESUMO TOTAL:`);
    console.log(`   Total de produtos: ${allProducts.length}`);
    console.log(`   Total de páginas processadas: ${totalPages}`);
    
    // Filtrar produtos com "agenda"
    const agendaProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes('agenda')
    );
    
    console.log(`\n📝 PRODUTOS COM "AGENDA" ENCONTRADOS: ${agendaProducts.length}`);
    console.log('=' .repeat(50));
    
    if (agendaProducts.length > 0) {
      agendaProducts.forEach((product, index) => {
        console.log(`${index + 1}. "${product.name}" (ID: ${product.id})`);
      });
    }
    
    // Verificar produtos específicos
    console.log('\n🎯 VERIFICANDO PRODUTOS ESPECÍFICOS:');
    console.log('=' .repeat(50));
    
    const specificProducts = [
      'AGENDA DIÁRIA 2026',
      'Agenda em cortiça',
      'Agenda em cortiça e linho',
      'Agenda A5',
      'Agenda B5'
    ];
    
    specificProducts.forEach(productName => {
      const found = allProducts.find(p => p.name === productName);
      if (found) {
        console.log(`✅ "${productName}" encontrado (ID: ${found.id})`);
      } else {
        console.log(`❌ "${productName}" NÃO encontrado`);
        
        // Buscar produtos similares
        const similar = allProducts.filter(p => 
          p.name.toLowerCase().includes(productName.toLowerCase().split(' ')[0])
        );
        if (similar.length > 0) {
          console.log(`   🔍 Produtos similares encontrados:`);
          similar.slice(0, 3).forEach(p => {
            console.log(`      - "${p.name}"`);
          });
        }
      }
    });
    
    // Contar produtos por tipo de agenda
    console.log('\n📊 CONTAGEM POR TIPO DE AGENDA:');
    console.log('=' .repeat(50));
    
    const agendaTypes = {};
    agendaProducts.forEach(product => {
      const name = product.name;
      if (agendaTypes[name]) {
        agendaTypes[name]++;
      } else {
        agendaTypes[name] = 1;
      }
    });
    
    Object.entries(agendaTypes).forEach(([name, count]) => {
      console.log(`   ${count}x "${name}"`);
    });
    
    // Verificar se há produtos com "DIÁRIA"
    console.log('\n🔍 PRODUTOS COM "DIÁRIA":');
    const diariaProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes('diária') || 
      product.name.toLowerCase().includes('diaria')
    );
    console.log(`   Encontrados: ${diariaProducts.length}`);
    diariaProducts.forEach(product => {
      console.log(`   - "${product.name}" (ID: ${product.id})`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error.message);
  }
}

debugAllPagesAgenda();
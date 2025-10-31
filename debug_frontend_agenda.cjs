// Script para debugar o problema das agendas no frontend
const { default: fetch } = require('node-fetch');

async function debugFrontendAgenda() {
  try {
    console.log('🔍 DEBUGGING FRONTEND AGENDA FILTER');
    console.log('=' .repeat(50));
    
    // 1. Testar API diretamente (como o frontend faz)
    console.log('\n1. Testando API diretamente (sem filtros):');
    const response = await fetch('http://localhost:3005/api/products?limit=500&sort=featured');
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Erro na API:', data.error);
      return;
    }
    
    const allProducts = data.data.items;
    console.log(`✅ Total de produtos retornados pela API: ${allProducts.length}`);
    
    // 2. Aplicar o mesmo filtro que o frontend usa para "Agenda"
    console.log('\n2. Aplicando filtro de "Agenda" (como no frontend):');
    const agendaProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes('agenda')
    );
    
    console.log(`📝 Produtos com "agenda" encontrados: ${agendaProducts.length}`);
    
    if (agendaProducts.length > 0) {
      console.log('\n📋 Lista de produtos com "agenda":');
      agendaProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
      });
    } else {
      console.log('❌ PROBLEMA IDENTIFICADO: Nenhum produto com "agenda" encontrado!');
    }
    
    // 3. Verificar produtos específicos mencionados pelo usuário
    console.log('\n3. Verificando produtos específicos:');
    const specificProducts = [
      'AGENDA DIÁRIA 2026',
      'Agenda em cortiça',
      'Agenda em cortiça e linho'
    ];
    
    specificProducts.forEach(productName => {
      const found = allProducts.find(p => p.name === productName);
      if (found) {
        console.log(`✅ "${productName}" encontrado (ID: ${found.id})`);
      } else {
        console.log(`❌ "${productName}" NÃO encontrado`);
      }
    });
    
    // 4. Verificar se há produtos com "AGENDA" em maiúscula
    console.log('\n4. Verificando produtos com "AGENDA" (maiúscula):');
    const agendaUpperProducts = allProducts.filter(product => 
      product.name.includes('AGENDA')
    );
    console.log(`📝 Produtos com "AGENDA" (maiúscula): ${agendaUpperProducts.length}`);
    
    // 5. Testar normalização de texto (como no frontend)
    console.log('\n5. Testando normalização de texto:');
    function normalizeText(text) {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    const normalizedAgendaProducts = allProducts.filter(product => {
      const normalizedName = normalizeText(product.name);
      return normalizedName.includes('agenda');
    });
    
    console.log(`📝 Produtos com "agenda" (após normalização): ${normalizedAgendaProducts.length}`);
    
    // 6. Verificar se o problema está na paginação
    console.log('\n6. Verificando paginação:');
    console.log(`📄 Página atual: ${data.data.pagination.currentPage}`);
    console.log(`📄 Total de páginas: ${data.data.pagination.totalPages}`);
    console.log(`📄 Total de itens: ${data.data.pagination.totalItems}`);
    console.log(`📄 Limite por página: ${data.data.pagination.limit}`);
    
    // 7. Simular exatamente o que o frontend faz
    console.log('\n7. Simulando exatamente o filtro do frontend:');
    const selectedCategory = 'Agenda';
    let filtered = [...allProducts];
    
    if (selectedCategory.toLowerCase() === 'agenda') {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes('agenda')
      );
    }
    
    console.log(`🎯 Resultado final do filtro frontend: ${filtered.length} produtos`);
    
    if (filtered.length === 0) {
      console.log('\n🚨 PROBLEMA CONFIRMADO: O filtro do frontend não está funcionando!');
      console.log('\n🔍 Analisando possíveis causas:');
      
      // Verificar se há produtos com variações de "agenda"
      const variations = ['agenda', 'AGENDA', 'Agenda'];
      variations.forEach(variation => {
        const count = allProducts.filter(p => p.name.includes(variation)).length;
        console.log(`   - Produtos com "${variation}": ${count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error.message);
  }
}

debugFrontendAgenda();
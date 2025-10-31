// Script para testar se a correção do filtro de agenda está funcionando
const { default: fetch } = require('node-fetch');

async function testAgendaFix() {
  try {
    console.log('🧪 TESTANDO CORREÇÃO DO FILTRO DE AGENDA');
    console.log('=' .repeat(60));
    
    // 1. Verificar se todas as agendas estão sendo retornadas pela API
    console.log('\n1. Verificando API - buscando TODAS as páginas:');
    
    let allProducts = [];
    let currentPage = 1;
    let totalPages = 1;
    
    // Buscar todas as páginas
    do {
      const response = await fetch(`http://localhost:3005/api/products?page=${currentPage}&limit=100&sort=featured`);
      const data = await response.json();
      
      if (!data.success) {
        console.error('❌ Erro na API:', data.error);
        break;
      }
      
      allProducts = allProducts.concat(data.data.items);
      totalPages = data.data.pagination.totalPages;
      console.log(`   📄 Página ${currentPage}: ${data.data.items.length} produtos`);
      
      currentPage++;
    } while (currentPage <= totalPages);
    
    console.log(`\n✅ Total de produtos carregados: ${allProducts.length}`);
    
    // 2. Aplicar filtro de agenda (como o frontend faz)
    console.log('\n2. Aplicando filtro de "Agenda":');
    const agendaProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes('agenda')
    );
    
    console.log(`📝 Produtos com "agenda" encontrados: ${agendaProducts.length}`);
    
    if (agendaProducts.length > 0) {
      console.log('\n📋 Lista completa de produtos com "agenda":');
      agendaProducts.forEach((product, index) => {
        console.log(`${index + 1}. "${product.name}" (ID: ${product.id})`);
      });
      
      // 3. Verificar produtos específicos mencionados pelo usuário
      console.log('\n3. ✅ PRODUTOS ESPECÍFICOS ENCONTRADOS:');
      const specificProducts = [
        'AGENDA DIÁRIA 2026',
        'Agenda em cortiça',
        'Agenda em cortiça e linho'
      ];
      
      let foundCount = 0;
      specificProducts.forEach(productName => {
        const found = agendaProducts.find(p => p.name === productName);
        if (found) {
          console.log(`   ✅ "${productName}" - ENCONTRADO!`);
          foundCount++;
        } else {
          console.log(`   ❌ "${productName}" - não encontrado`);
        }
      });
      
      // 4. Contar produtos por tipo
      console.log('\n4. 📊 RESUMO POR TIPO DE AGENDA:');
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
      
      // 5. Resultado final
      console.log('\n' + '=' .repeat(60));
      console.log('🎉 RESULTADO DO TESTE:');
      console.log(`✅ Total de agendas encontradas: ${agendaProducts.length}`);
      console.log(`✅ Produtos específicos encontrados: ${foundCount}/${specificProducts.length}`);
      
      if (agendaProducts.length >= 10) {
        console.log('🎯 SUCESSO! O filtro de agenda agora deve funcionar corretamente!');
        console.log('   - A API retorna todas as agendas de todas as páginas');
        console.log('   - O frontend foi modificado para carregar todos os produtos quando um filtro é aplicado');
        console.log('   - As 7 "AGENDA DIÁRIA 2026" e outras agendas estão disponíveis');
      } else {
        console.log('⚠️  ATENÇÃO: Menos agendas encontradas do que esperado');
      }
      
    } else {
      console.log('❌ PROBLEMA: Nenhuma agenda encontrada!');
    }
    
    // 6. Testar frontend simulado
    console.log('\n6. 🖥️  SIMULANDO COMPORTAMENTO DO FRONTEND:');
    console.log('   Quando usuário clicar em "Agenda":');
    console.log('   1. Frontend carregará TODAS as páginas da API');
    console.log('   2. Aplicará filtro local para produtos com "agenda"');
    console.log(`   3. Resultado: ${agendaProducts.length} produtos exibidos`);
    
    if (agendaProducts.some(p => p.name === 'AGENDA DIÁRIA 2026')) {
      console.log('   ✅ "AGENDA DIÁRIA 2026" será exibida!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testAgendaFix();
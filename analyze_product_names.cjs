// Script para analisar os nomes dos produtos e identificar problemas de espaços/caracteres
const { default: fetch } = require('node-fetch');

async function analyzeProductNames() {
  try {
    console.log('🔍 ANALISANDO NOMES DOS PRODUTOS DE AGENDA');
    console.log('=' .repeat(60));
    
    // Buscar todos os produtos
    let allProducts = [];
    let currentPage = 1;
    let totalPages = 1;
    
    do {
      const response = await fetch(`http://localhost:3005/api/products?page=${currentPage}&limit=100&sort=featured`);
      const data = await response.json();
      
      if (!data.success) break;
      
      allProducts = allProducts.concat(data.data.items);
      totalPages = data.data.pagination.totalPages;
      currentPage++;
    } while (currentPage <= totalPages);
    
    // Filtrar produtos com "agenda"
    const agendaProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes('agenda')
    );
    
    console.log('📋 ANÁLISE DETALHADA DOS NOMES:');
    console.log('\nProdutos encontrados com análise de caracteres:');
    
    agendaProducts.forEach((product, index) => {
      const name = product.name;
      const trimmedName = name.trim();
      const hasLeadingSpace = name !== trimmedName;
      const length = name.length;
      const trimmedLength = trimmedName.length;
      
      console.log(`\n${index + 1}. Produto ID: ${product.id}`);
      console.log(`   Nome original: "${name}"`);
      console.log(`   Nome sem espaços: "${trimmedName}"`);
      console.log(`   Comprimento: ${length} chars (trimmed: ${trimmedLength})`);
      console.log(`   Tem espaço inicial: ${hasLeadingSpace ? '✅ SIM' : '❌ NÃO'}`);
      
      // Mostrar caracteres especiais
      const chars = [];
      for (let i = 0; i < Math.min(name.length, 50); i++) {
        const char = name[i];
        const code = char.charCodeAt(0);
        if (code < 32 || code > 126) {
          chars.push(`[${i}]:${code}`);
        } else if (char === ' ') {
          chars.push(`[${i}]:SPACE`);
        }
      }
      if (chars.length > 0) {
        console.log(`   Caracteres especiais: ${chars.join(', ')}`);
      }
    });
    
    // Verificar produtos específicos com diferentes variações
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 TESTANDO VARIAÇÕES DOS PRODUTOS ESPECÍFICOS:');
    
    const specificProducts = [
      'AGENDA DIÁRIA 2026',
      'Agenda em cortiça',
      'Agenda em cortiça e linho'
    ];
    
    specificProducts.forEach(targetName => {
      console.log(`\n🔍 Procurando por: "${targetName}"`);
      
      // Busca exata
      const exactMatch = agendaProducts.find(p => p.name === targetName);
      if (exactMatch) {
        console.log(`   ✅ Encontrado exato: "${exactMatch.name}"`);
      } else {
        console.log(`   ❌ Não encontrado exato`);
      }
      
      // Busca com trim
      const trimMatch = agendaProducts.find(p => p.name.trim() === targetName);
      if (trimMatch) {
        console.log(`   ✅ Encontrado com trim: "${trimMatch.name}"`);
      } else {
        console.log(`   ❌ Não encontrado com trim`);
      }
      
      // Busca case-insensitive
      const caseMatch = agendaProducts.find(p => p.name.toLowerCase() === targetName.toLowerCase());
      if (caseMatch) {
        console.log(`   ✅ Encontrado case-insensitive: "${caseMatch.name}"`);
      } else {
        console.log(`   ❌ Não encontrado case-insensitive`);
      }
      
      // Busca com trim + case-insensitive
      const bothMatch = agendaProducts.find(p => p.name.trim().toLowerCase() === targetName.toLowerCase());
      if (bothMatch) {
        console.log(`   ✅ Encontrado trim+case: "${bothMatch.name}"`);
      } else {
        console.log(`   ❌ Não encontrado trim+case`);
      }
      
      // Mostrar produtos similares
      const similarProducts = agendaProducts.filter(p => 
        p.name.toLowerCase().includes(targetName.toLowerCase().split(' ')[0]) ||
        targetName.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
      );
      
      if (similarProducts.length > 0) {
        console.log(`   🔍 Produtos similares encontrados:`);
        similarProducts.forEach(p => {
          console.log(`      - "${p.name}"`);
        });
      }
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log('💡 CONCLUSÃO:');
    console.log('Se alguns produtos não foram encontrados exatamente, pode ser devido a:');
    console.log('1. Espaços extras no início/fim do nome');
    console.log('2. Diferenças de capitalização');
    console.log('3. Caracteres especiais invisíveis');
    console.log('\n✅ SOLUÇÃO: O frontend deve usar .trim() e comparação case-insensitive');
    
  } catch (error) {
    console.error('❌ Erro durante análise:', error.message);
  }
}

analyzeProductNames();
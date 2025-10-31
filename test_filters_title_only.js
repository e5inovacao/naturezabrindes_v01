import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ixqjzqfvwvvtsbpnqzpx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWp6cWZ2d3Z2dHNicG5xenB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE5NzQsImV4cCI6MjA1MDU0Nzk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFiltersWithTitleOnly() {
  console.log('=== TESTE: Filtros apenas pelo título ===\n');
  
  try {
    // Buscar todos os produtos
    const { data: allProducts, error } = await supabase
      .from('ecologic_products_site')
      .select('*')
      .limit(10000);
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return;
    }
    
    console.log(`Total de produtos na base: ${allProducts.length}\n`);
    
    // Testar filtro de Canetas (apenas no título)
    const canetasFilter = allProducts.filter(product => 
      product.titulo.toLowerCase().includes('caneta')
    );
    
    console.log(`🖊️  CANETAS (filtro apenas no título): ${canetasFilter.length} produtos`);
    if (canetasFilter.length > 0) {
      console.log('Exemplos de canetas encontradas:');
      canetasFilter.slice(0, 5).forEach(p => {
        console.log(`   - ${p.titulo}`);
      });
    }
    console.log('');
    
    // Testar filtro de Canivetes (apenas no título)
    const canivetes = allProducts.filter(product => 
      product.titulo.toLowerCase().includes('canivete')
    );
    
    console.log(`🔪 CANIVETES (filtro apenas no título): ${canivetes.length} produtos`);
    if (canivetes.length > 0) {
      console.log('Exemplos de canivetes encontrados:');
      canivetes.slice(0, 5).forEach(p => {
        console.log(`   - ${p.titulo}`);
      });
    }
    console.log('');
    
    // Testar filtro de Canecas (apenas no título)
    const canecas = allProducts.filter(product => 
      product.titulo.toLowerCase().includes('caneca')
    );
    
    console.log(`☕ CANECAS (filtro apenas no título): ${canecas.length} produtos`);
    if (canecas.length > 0) {
      console.log('Exemplos de canecas encontradas:');
      canecas.slice(0, 5).forEach(p => {
        console.log(`   - ${p.titulo}`);
      });
    }
    console.log('');
    
    // Testar filtro de Agenda (apenas no título)
    const agendas = allProducts.filter(product => 
      product.titulo.toLowerCase().trim().includes('agenda')
    );
    
    console.log(`📅 AGENDAS (filtro apenas no título): ${agendas.length} produtos`);
    if (agendas.length > 0) {
      console.log('Exemplos de agendas encontradas:');
      agendas.slice(0, 5).forEach(p => {
        console.log(`   - ${p.titulo}`);
      });
    }
    console.log('');
    
    // Resumo dos resultados
    console.log('=== RESUMO DOS FILTROS ===');
    console.log(`Canetas: ${canetasFilter.length} produtos`);
    console.log(`Canivetes: ${canivetes.length} produtos`);
    console.log(`Canecas: ${canecas.length} produtos`);
    console.log(`Agendas: ${agendas.length} produtos`);
    
    if (canetasFilter.length === 0) {
      console.log('\n⚠️  ATENÇÃO: Nenhuma caneta encontrada no título!');
      // Verificar se há canetas na descrição
      const canetasDescricao = allProducts.filter(product => 
        (product.descricao || '').toLowerCase().includes('caneta')
      );
      console.log(`Canetas encontradas na descrição: ${canetasDescricao.length}`);
    }
    
    if (canivetes.length === 0) {
      console.log('\n⚠️  ATENÇÃO: Nenhum canivete encontrado no título!');
      // Verificar se há canivetes na descrição
      const caniveteDescricao = allProducts.filter(product => 
        (product.descricao || '').toLowerCase().includes('canivete')
      );
      console.log(`Canivetes encontrados na descrição: ${caniveteDescricao.length}`);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

// Executar o teste
testFiltersWithTitleOnly();
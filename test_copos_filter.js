import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://dntlbhmljceaefycdsbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudGxiaG1samNlYWVmeWNkc2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDU4MDMsImV4cCI6MjA2MzY4MTgwM30.DyBPu5O9C8geyV6pliyIGkhwGegwV_9FQeKQ8prSdHY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para normalizar texto (copiada do Catalog.tsx)
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Função para mapear produto (simplificada)
function mapEcologicToProduct(ecologicProduct) {
  return {
    id: `ecologic-${ecologicProduct.codigo || ecologicProduct.id}`,
    name: ecologicProduct.titulo,
    category: 'geral',
    images: [ecologicProduct.img_0]
  };
}

async function testCoposFilter() {
  console.log('=== TESTE: Filtragem da categoria Copos ===');
  
  try {
    // Buscar produtos que contenham os termos da categoria Copos
    console.log('\n🔍 Buscando produtos para teste de filtragem...');
    const { data: products, error } = await supabase
      .from('ecologic_products_site')
      .select('id, codigo, titulo, categoria, img_0')
      .or('titulo.ilike.%copo%,titulo.ilike.%caneca%,titulo.ilike.%xícara%,titulo.ilike.%mug%')
      .limit(20);
    
    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return;
    }
    
    console.log(`✅ Produtos encontrados: ${products?.length || 0}`);
    
    if (!products || products.length === 0) {
      console.log('❌ Nenhum produto encontrado para teste');
      return;
    }
    
    // Mapear produtos
    const mappedProducts = products.map(mapEcologicToProduct);
    console.log('\n📋 Produtos mapeados:');
    mappedProducts.forEach(p => {
      console.log(`- ${p.name} (ID: ${p.id})`);
    });
    
    // Simular a lógica de filtragem do Catalog.tsx para categoria 'Copos'
    console.log('\n🔍 Testando lógica de filtragem para categoria "Copos"...');
    
    const categoryLower = 'copos';
    let filtered = mappedProducts;
    
    if (categoryLower === 'copos') {
      // Lógica exata do Catalog.tsx
      filtered = filtered.filter(product => {
        const productName = normalizeText(product.name);
        const hasCopo = productName.includes('copo') && !productName.includes('copo termico');
        const hasCaneca = productName.includes('caneca');
        const hasXicara = productName.includes('xicara');
        const hasMug = productName.includes('mug');
        
        const shouldInclude = hasCopo || hasCaneca || hasXicara || hasMug;
        
        console.log(`[DEBUG Copos] Produto: "${product.name}"`);
        console.log(`  - Nome normalizado: "${productName}"`);
        console.log(`  - Tem 'copo' (sem térmico): ${hasCopo}`);
        console.log(`  - Tem 'caneca': ${hasCaneca}`);
        console.log(`  - Tem 'xicara': ${hasXicara}`);
        console.log(`  - Tem 'mug': ${hasMug}`);
        console.log(`  - Deve incluir: ${shouldInclude}`);
        console.log('---');
        
        return shouldInclude;
      });
    }
    
    console.log(`\n📊 Resultado da filtragem:`);
    console.log(`- Produtos antes da filtragem: ${mappedProducts.length}`);
    console.log(`- Produtos após filtragem: ${filtered.length}`);
    
    if (filtered.length > 0) {
      console.log('\n✅ Produtos que passaram na filtragem:');
      filtered.forEach(p => {
        console.log(`- ${p.name}`);
      });
    } else {
      console.log('\n❌ Nenhum produto passou na filtragem!');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
  
  console.log('\n🏁 Teste concluído!');
}

testCoposFilter();
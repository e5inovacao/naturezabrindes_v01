import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://dntlbhmljceaefycdsbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudGxiaG1samNlYWVmeWNkc2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDU4MDMsImV4cCI6MjA2MzY4MTgwM30.DyBPu5O9C8geyV6pliyIGkhwGegwV_9FQeKQ8prSdHY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCoposProducts() {
  console.log('=== TESTE: Produtos da categoria Copos ===');
  
  try {
    // Buscar todos os produtos que contenham 'copo', 'caneca', 'xícara' ou 'mug'
    console.log('\n🔍 Buscando produtos com "copo" no título...');
    const { data: copoProducts, error: copoError } = await supabase
      .from('ecologic_products_site')
      .select('id, codigo, titulo, categoria, descricao')
      .ilike('titulo', '%copo%');
    
    if (copoError) {
      console.error('❌ Erro ao buscar produtos com "copo":', copoError);
    } else {
      console.log(`✅ Produtos com "copo" encontrados: ${copoProducts?.length || 0}`);
      if (copoProducts && copoProducts.length > 0) {
        console.log('Exemplos:');
        copoProducts.slice(0, 5).forEach(produto => {
          console.log(`- ${produto.titulo} (categoria: ${produto.categoria})`);
        });
      }
    }

    console.log('\n🔍 Buscando produtos com "caneca" no título...');
    const { data: canecaProducts, error: canecaError } = await supabase
      .from('ecologic_products_site')
      .select('id, codigo, titulo, categoria, descricao')
      .ilike('titulo', '%caneca%');
    
    if (canecaError) {
      console.error('❌ Erro ao buscar produtos com "caneca":', canecaError);
    } else {
      console.log(`✅ Produtos com "caneca" encontrados: ${canecaProducts?.length || 0}`);
      if (canecaProducts && canecaProducts.length > 0) {
        console.log('Exemplos:');
        canecaProducts.slice(0, 5).forEach(produto => {
          console.log(`- ${produto.titulo} (categoria: ${produto.categoria})`);
        });
      }
    }

    console.log('\n🔍 Buscando produtos com "xícara" no título...');
    const { data: xicaraProducts, error: xicaraError } = await supabase
      .from('ecologic_products_site')
      .select('id, codigo, titulo, categoria, descricao')
      .ilike('titulo', '%xícara%');
    
    if (xicaraError) {
      console.error('❌ Erro ao buscar produtos com "xícara":', xicaraError);
    } else {
      console.log(`✅ Produtos com "xícara" encontrados: ${xicaraProducts?.length || 0}`);
      if (xicaraProducts && xicaraProducts.length > 0) {
        console.log('Exemplos:');
        xicaraProducts.slice(0, 5).forEach(produto => {
          console.log(`- ${produto.titulo} (categoria: ${produto.categoria})`);
        });
      }
    }

    console.log('\n🔍 Buscando produtos com "mug" no título...');
    const { data: mugProducts, error: mugError } = await supabase
      .from('ecologic_products_site')
      .select('id, codigo, titulo, categoria, descricao')
      .ilike('titulo', '%mug%');
    
    if (mugError) {
      console.error('❌ Erro ao buscar produtos com "mug":', mugError);
    } else {
      console.log(`✅ Produtos com "mug" encontrados: ${mugProducts?.length || 0}`);
      if (mugProducts && mugProducts.length > 0) {
        console.log('Exemplos:');
        mugProducts.slice(0, 5).forEach(produto => {
          console.log(`- ${produto.titulo} (categoria: ${produto.categoria})`);
        });
      }
    }

    // Contar total de produtos únicos
    const allProducts = [
      ...(copoProducts || []),
      ...(canecaProducts || []),
      ...(xicaraProducts || []),
      ...(mugProducts || [])
    ];
    
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );

    console.log(`\n📊 Total de produtos únicos que deveriam aparecer na categoria "Copos": ${uniqueProducts.length}`);
    
    if (uniqueProducts.length > 0) {
      console.log('\n📋 Lista completa de produtos únicos:');
      uniqueProducts.forEach((produto, index) => {
        console.log(`${index + 1}. ${produto.titulo} (ID: ${produto.id}, Categoria: ${produto.categoria})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testCoposProducts();
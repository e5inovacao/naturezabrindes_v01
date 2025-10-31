import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function testCorrectColumns() {
  console.log('🔍 Testando com os nomes corretos das colunas...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis de ambiente do Supabase não estão configuradas!');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Teste 1: Buscar 5 registros com os nomes corretos das colunas
    console.log('📋 Buscando 5 registros com colunas corretas...');
    const { data, error } = await supabase
      .from('ecologic_products_site')
      .select('id, titulo, descricao, categoria, codigo, tipo')
      .limit(5);
    
    if (error) {
      console.error('❌ Erro ao buscar dados:', error);
    } else {
      console.log('✅ Primeiros 5 registros encontrados:');
      console.log(JSON.stringify(data, null, 2));
    }
    
    // Teste 2: Buscar produtos da categoria 'papelaria'
    console.log('\n📋 Buscando produtos da categoria "papelaria"...');
    const { data: papelaria, error: papelError } = await supabase
      .from('ecologic_products_site')
      .select('id, titulo, descricao, categoria')
      .eq('categoria', 'papelaria')
      .limit(10);
    
    if (papelError) {
      console.error('❌ Erro ao buscar categoria papelaria:', papelError);
    } else {
      console.log(`✅ Produtos da categoria papelaria encontrados: ${papelaria?.length || 0}`);
      if (papelaria && papelaria.length > 0) {
        console.log('Exemplos:');
        papelaria.slice(0, 3).forEach(produto => {
          console.log(`- ${produto.titulo} (categoria: ${produto.categoria})`);
        });
      }
    }
    
    // Teste 3: Buscar produtos que contenham 'caneta' no título
    console.log('\n📋 Buscando produtos com "caneta" no título...');
    const { data: canetas, error: canetaError } = await supabase
      .from('ecologic_products_site')
      .select('id, titulo, descricao, categoria')
      .ilike('titulo', '%caneta%')
      .limit(10);
    
    if (canetaError) {
      console.error('❌ Erro ao buscar canetas:', canetaError);
    } else {
      console.log(`✅ Produtos com "caneta" no título: ${canetas?.length || 0}`);
      if (canetas && canetas.length > 0) {
        console.log('Exemplos:');
        canetas.slice(0, 3).forEach(produto => {
          console.log(`- ${produto.titulo} (categoria: ${produto.categoria})`);
        });
      }
    }
    
    // Teste 4: Verificar todas as categorias disponíveis
    console.log('\n📊 Verificando todas as categorias disponíveis...');
    const { data: categorias, error: catError } = await supabase
      .from('ecologic_products_site')
      .select('categoria')
      .not('categoria', 'is', null);
    
    if (catError) {
      console.error('❌ Erro ao buscar categorias:', catError);
    } else {
      const uniqueCategories = [...new Set(categorias?.map(item => item.categoria) || [])];
      console.log('✅ Categorias únicas encontradas:');
      uniqueCategories.forEach(cat => console.log(`- ${cat}`));
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
  
  console.log('\n🏁 Teste concluído!');
}

// Executar o teste
testCorrectColumns().catch(console.error);
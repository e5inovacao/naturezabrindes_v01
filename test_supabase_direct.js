// Teste direto do Supabase para verificar acesso aos dados
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== TESTE DIRETO SUPABASE ===');
console.log('URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabaseAccess() {
  try {
    console.log('\n1. Testando acesso à tabela ecologic_products_site...');
    
    // Teste 1: Contar total de registros
    const { count, error: countError } = await supabase
      .from('ecologic_products_site')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar registros:', countError);
      return;
    }
    
    console.log(`✅ Total de registros na tabela: ${count}`);
    
    if (count === 0) {
      console.log('⚠️  Tabela está vazia!');
      return;
    }
    
    // Teste 2: Buscar primeiros 5 registros
    console.log('\n2. Buscando primeiros 5 registros...');
    const { data: firstRecords, error: selectError } = await supabase
      .from('ecologic_products_site')
      .select('id, codigo, titulo, categoria')
      .limit(5);
    
    if (selectError) {
      console.error('❌ Erro ao buscar registros:', selectError);
      return;
    }
    
    console.log('✅ Primeiros 5 registros:');
    firstRecords?.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, Código: ${record.codigo}, Título: ${record.titulo}, Categoria: ${record.categoria}`);
    });
    
    // Teste 3: Buscar produtos com "caneta" no título
    console.log('\n3. Buscando produtos com "caneta" no título...');
    const { data: canetaRecords, error: canetaError } = await supabase
      .from('ecologic_products_site')
      .select('id, codigo, titulo, categoria')
      .ilike('titulo', '%caneta%');
    
    if (canetaError) {
      console.error('❌ Erro ao buscar canetas:', canetaError);
      return;
    }
    
    console.log(`✅ Produtos com "caneta" encontrados: ${canetaRecords?.length || 0}`);
    canetaRecords?.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.titulo} (${record.categoria})`);
    });
    
    // Teste 4: Buscar produtos da categoria "papelaria"
    console.log('\n4. Buscando produtos da categoria "papelaria"...');
    const { data: papelariaRecords, error: papelariaError } = await supabase
      .from('ecologic_products_site')
      .select('id, codigo, titulo, categoria')
      .ilike('categoria', '%papelaria%');
    
    if (papelariaError) {
      console.error('❌ Erro ao buscar papelaria:', papelariaError);
      return;
    }
    
    console.log(`✅ Produtos de "papelaria" encontrados: ${papelariaRecords?.length || 0}`);
    papelariaRecords?.slice(0, 5).forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.titulo} (${record.categoria})`);
    });
    
    // Teste 5: Listar todas as categorias únicas
    console.log('\n5. Listando categorias únicas...');
    const { data: categories, error: catError } = await supabase
      .from('ecologic_products_site')
      .select('categoria')
      .not('categoria', 'is', null);
    
    if (catError) {
      console.error('❌ Erro ao buscar categorias:', catError);
      return;
    }
    
    const uniqueCategories = [...new Set(categories?.map(c => c.categoria))].sort();
    console.log(`✅ Total de categorias únicas: ${uniqueCategories.length}`);
    console.log('Primeiras 10 categorias:');
    uniqueCategories.slice(0, 10).forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat}`);
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testSupabaseAccess();
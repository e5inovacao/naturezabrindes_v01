import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔍 Testando acesso à tabela ecologic_products_site...');
console.log('Environment variables loaded:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// Configurar cliente Supabase com service role (máximas permissões)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testEcologicProductsAccess() {
  try {
    console.log('\n📊 Teste 1: Verificando se a tabela existe e contando registros...');
    
    // Teste 1: Contar registros na tabela
    const { count, error: countError } = await supabaseAdmin
      .from('ecologic_products_site')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar registros:', countError);
      console.error('Detalhes do erro:', JSON.stringify(countError, null, 2));
      return;
    }
    
    console.log(`✅ Tabela encontrada! Total de registros: ${count}`);
    
    if (count === 0) {
      console.log('⚠️  A tabela existe mas está vazia.');
      return;
    }
    
    console.log('\n📋 Teste 2: Buscando primeiros 5 registros...');
    
    // Teste 2: Buscar alguns registros de exemplo
    const { data: sampleData, error: sampleError } = await supabaseAdmin
      .from('ecologic_products_site')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Erro ao buscar registros de exemplo:', sampleError);
      console.error('Detalhes do erro:', JSON.stringify(sampleError, null, 2));
      return;
    }
    
    console.log(`✅ Encontrados ${sampleData.length} registros de exemplo:`);
    sampleData.forEach((product, index) => {
      console.log(`\n📦 Produto ${index + 1}:`);
      console.log(`  - ID: ${product.id || 'N/A'}`);
      console.log(`  - Código: ${product.codigo || 'N/A'}`);
      console.log(`  - Título: ${product.titulo || 'N/A'}`);
      console.log(`  - Categoria: ${product.categoria || 'N/A'}`);
      console.log(`  - Preço: ${product.preco || 'N/A'}`);
    });
    
    console.log('\n🔍 Teste 3: Verificando estrutura da tabela...');
    
    // Teste 3: Verificar colunas disponíveis
    if (sampleData.length > 0) {
      const columns = Object.keys(sampleData[0]);
      console.log(`✅ Colunas disponíveis (${columns.length}):`, columns.join(', '));
    }
    
    console.log('\n🎯 Teste 4: Testando filtros específicos...');
    
    // Teste 4: Testar filtro por categoria
    const { data: categoryData, error: categoryError } = await supabaseAdmin
      .from('ecologic_products_site')
      .select('*')
      .ilike('categoria', '%caneta%')
      .limit(3);
    
    if (categoryError) {
      console.error('❌ Erro ao filtrar por categoria:', categoryError);
    } else {
      console.log(`✅ Produtos com 'caneta' na categoria: ${categoryData.length}`);
      categoryData.forEach(product => {
        console.log(`  - ${product.titulo} (Categoria: ${product.categoria})`);
      });
    }
    
    console.log('\n🎉 Todos os testes concluídos com sucesso!');
    
  } catch (error) {
    console.error('💥 Erro inesperado durante os testes:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Executar os testes
testEcologicProductsAccess()
  .then(() => {
    console.log('\n✨ Script de teste finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
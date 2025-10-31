import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCanetasFilter() {
  try {
    console.log('=== TESTE DO FILTRO DE CANETAS ===\n');
    
    // 1. Verificar produtos na tabela que contenham 'caneta'
    console.log('1. Buscando produtos com "caneta" na tabela...');
    
    const { data: dbProducts, error: dbError } = await supabase
      .from('ecologic_products_site')
      .select('id, titulo, descricao, categoria')
      .or('titulo.ilike.%caneta%,descricao.ilike.%caneta%')
      .order('titulo');
    
    if (dbError) {
      console.error('Erro ao buscar produtos:', dbError);
      return;
    }
    
    console.log(`   Encontrados ${dbProducts.length} produtos na tabela:`);
    
    dbProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ID: ${product.id} - ${product.titulo}`);
      if (product.descricao && product.descricao.toLowerCase().includes('caneta')) {
        console.log(`      Descrição: ${product.descricao.substring(0, 100)}...`);
      }
    });
    
    console.log('\n2. Testando API /products com filtro "Canetas"...');
    
    // 2. Testar a API com filtro de canetas
    try {
      const apiResponse = await axios.get('http://localhost:3005/api/products?category=Canetas');
      console.log('   Estrutura da resposta da API:', JSON.stringify(apiResponse.data, null, 2));
      
      const apiProducts = apiResponse.data?.data?.items || [];
      console.log(`   API retornou ${apiProducts.length} produtos:`);
      
      apiProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ID: ${product.id} - ${product.name}`);
      });
      
      // 3. Comparar resultados
      console.log('\n3. Comparação dos resultados:');
      console.log(`   Produtos na tabela: ${dbProducts.length}`);
      console.log(`   Produtos na API: ${apiProducts.length}`);
      
      if (dbProducts.length !== apiProducts.length) {
        console.log('   ⚠️  PROBLEMA DETECTADO: Números diferentes!');
        
        // Identificar produtos que estão na tabela mas não na API
        const dbIds = dbProducts.map(p => p.id);
        const apiIds = apiProducts.map(p => p.id);
        
        const missingInApi = dbIds.filter(id => !apiIds.includes(id));
        const extraInApi = apiIds.filter(id => !dbIds.includes(id));
        
        if (missingInApi.length > 0) {
          console.log(`   Produtos na tabela mas não na API: ${missingInApi.join(', ')}`);
        }
        
        if (extraInApi.length > 0) {
          console.log(`   Produtos na API mas não encontrados na busca da tabela: ${extraInApi.join(', ')}`);
        }
      } else {
        console.log('   ✅ Números coincidem!');
      }
      
    } catch (apiError) {
      console.error('   Erro ao testar API:', apiError.message);
      if (apiError.response) {
        console.error('   Status:', apiError.response.status);
        console.error('   Data:', apiError.response.data);
      }
    }
    
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

// Executar o teste
testCanetasFilter();
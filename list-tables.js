// Script para listar todas as tabelas no Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listTables() {
  console.log('🔍 Listando tabelas disponíveis no Supabase...');
  
  // Lista de tabelas conhecidas para testar
  const knownTables = [
    'usuarios_clientes',
    'solicitacao_orcamentos', 
    'products_solicitacao',
    'product_solicitacao',
    'solicitacao_produtos',
    'orcamento_produtos',
    'quote_products',
    'quote_items'
  ];
  
  for (const tableName of knownTables) {
    try {
      console.log(`\n📋 Testando tabela: ${tableName}`);
      
      // Tentar fazer uma consulta simples para ver se a tabela existe
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: existe (${count || 0} registros)`);
        
        // Se a tabela existe, tentar pegar um registro para ver o schema
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!sampleError && sampleData && sampleData.length > 0) {
          console.log(`   📊 Campos: ${Object.keys(sampleData[0]).join(', ')}`);
        } else if (!sampleError) {
          console.log(`   📊 Tabela vazia, não foi possível determinar o schema`);
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: Erro geral - ${err.message}`);
    }
  }
}

listTables().then(() => {
  console.log('\n🎉 Verificação de tabelas concluída!');
});
// Script para verificar o schema da tabela products_solicitacao
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

async function checkProductsTable() {
  console.log('🔍 Verificando schema da tabela products_solicitacao...');
  
  try {
    // Tentar inserir um registro de teste para ver o schema
    const { data: testRecord, error: insertError } = await supabase
      .from('products_solicitacao')
      .insert({
        solicitacao_id: 1,
        produto_nome: 'Produto Teste Schema',
        quantidade: 1,
        valor_unitario_estimado: 10.00
      })
      .select('*')
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir registro de teste:', insertError);
      
      // Tentar com product_name em vez de produto_nome
      console.log('🔄 Tentando com product_name...');
      const { data: testRecord2, error: insertError2 } = await supabase
        .from('products_solicitacao')
        .insert({
          solicitacao_id: 1,
          product_name: 'Produto Teste Schema',
          quantity: 1
        })
        .select('*')
        .single();
      
      if (insertError2) {
        console.error('❌ Erro com product_name também:', insertError2);
        return false;
      } else {
        console.log('✅ Registro criado com product_name!');
        console.log('📋 Schema da tabela:', Object.keys(testRecord2));
        
        // Limpar registro de teste
        await supabase
          .from('products_solicitacao')
          .delete()
          .eq('product_name', 'Produto Teste Schema');
        
        return testRecord2;
      }
    } else {
      console.log('✅ Registro criado com produto_nome!');
      console.log('📋 Schema da tabela:', Object.keys(testRecord));
      
      // Limpar registro de teste
      await supabase
        .from('products_solicitacao')
        .delete()
        .eq('produto_nome', 'Produto Teste Schema');
      
      return testRecord;
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
    return false;
  }
}

checkProductsTable().then(result => {
  if (result) {
    console.log('🎉 Schema da tabela products_solicitacao identificado!');
    console.log('📊 Campos disponíveis:', Object.keys(result));
  } else {
    console.log('❌ Falha ao identificar o schema da tabela');
  }
});
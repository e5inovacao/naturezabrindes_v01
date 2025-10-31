// Script para verificar e recriar a tabela solicitacao_orcamentos com schema completo
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

async function recreateTable() {
  console.log('🔧 Recriando tabela solicitacao_orcamentos com schema completo...');
  
  try {
    // Primeiro, tentar deletar a tabela se existir
    console.log('🗑️ Removendo tabela existente...');
    const { error: dropError } = await supabase
      .from('solicitacao_orcamentos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos os registros
    
    if (dropError) {
      console.log('⚠️ Erro ao limpar tabela (pode não existir):', dropError.message);
    }
    
    // Criar um registro com todos os campos necessários para forçar a criação do schema
    console.log('📝 Criando registro com schema completo...');
    const { data: newRecord, error: insertError } = await supabase
      .from('solicitacao_orcamentos')
      .insert({
        numero_solicitacao: 'SOL-TEST-001',
        nome_cliente: 'Cliente Teste Schema',
        email_cliente: 'schema.teste@email.com',
        telefone_cliente: '(11) 99999-9999',
        empresa_cliente: 'Empresa Schema Teste',
        cnpj_cliente: '12.345.678/0001-90',
        endereco_cliente: 'Rua Teste, 123',
        observacoes: 'Teste de criação de schema',
        valor_total_estimado: 1500.00,
        status: 'pendente'
      })
      .select('*')
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao criar registro de teste:', insertError);
      return false;
    }
    
    console.log('✅ Registro criado com sucesso!');
    console.log('📋 Schema da tabela:', Object.keys(newRecord));
    
    // Verificar se o ID foi gerado
    if (newRecord.id) {
      console.log('✅ Campo ID confirmado:', newRecord.id);
    } else {
      console.error('❌ Campo ID não encontrado no registro!');
    }
    
    // Limpar o registro de teste
    console.log('🧹 Removendo registro de teste...');
    const { error: deleteError } = await supabase
      .from('solicitacao_orcamentos')
      .delete()
      .eq('email_cliente', 'schema.teste@email.com');
    
    if (deleteError) {
      console.error('⚠️ Erro ao remover registro de teste:', deleteError);
    } else {
      console.log('✅ Registro de teste removido');
    }
    
    // Testar uma consulta simples para verificar o schema
    console.log('🔍 Testando consulta na tabela...');
    const { data: testData, error: testError } = await supabase
      .from('solicitacao_orcamentos')
      .select('id, nome_cliente, email_cliente')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na consulta de teste:', testError);
      return false;
    } else {
      console.log('✅ Consulta de teste bem-sucedida!');
      console.log('📊 Dados encontrados:', testData?.length || 0, 'registros');
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
    return false;
  }
}

recreateTable().then(success => {
  if (success) {
    console.log('🎉 Tabela solicitacao_orcamentos configurada com sucesso!');
  } else {
    console.log('❌ Falha ao configurar a tabela');
  }
});
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://dntlbhmljceaefycdsbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudGxiaG1samNlYWVmeWNkc2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDU4MDMsImV4cCI6MjA2MzY4MTgwM30.DyBPu5O9C8geyV6pliyIGkhwGegwV_9FQeKQ8prSdHY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserCreation() {
  console.log('🧪 Iniciando teste de criação de usuário...');
  
  const testUserData = {
    nome: 'Teste Cliente',
    email: 'teste@exemplo.com',
    telefone: '(11) 99999-9999',
    empresa: 'Empresa Teste',
    cnpj: '12.345.678/0001-90'
  };
  
  console.log('📝 Dados do teste:', testUserData);
  
  try {
    // Teste 1: Verificar conexão
    console.log('\n🔗 Teste 1: Verificando conexão com Supabase...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('usuarios_clientes')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Erro de conexão:', connectionError);
      return;
    }
    console.log('✅ Conexão OK');
    
    // Teste 2: Tentar inserir usuário
    console.log('\n👤 Teste 2: Tentando inserir usuário...');
    const { data: newUser, error: insertError } = await supabase
      .from('usuarios_clientes')
      .insert(testUserData)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir usuário:');
      console.error('❌ Código do erro:', insertError.code);
      console.error('❌ Mensagem:', insertError.message);
      console.error('❌ Detalhes:', insertError.details);
      console.error('❌ Hint:', insertError.hint);
      return;
    }
    
    if (newUser) {
      console.log('✅ Usuário criado com sucesso!');
      console.log('✅ ID:', newUser.id);
      console.log('✅ Nome:', newUser.nome);
      
      // Teste 3: Limpar dados de teste
      console.log('\n🧹 Teste 3: Limpando dados de teste...');
      const { error: deleteError } = await supabase
        .from('usuarios_clientes')
        .delete()
        .eq('id', newUser.id);
      
      if (deleteError) {
        console.error('❌ Erro ao limpar dados de teste:', deleteError);
      } else {
        console.log('✅ Dados de teste limpos com sucesso');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testUserCreation().then(() => {
  console.log('\n🏁 Teste concluído');
}).catch(error => {
  console.error('❌ Erro fatal no teste:', error);
});
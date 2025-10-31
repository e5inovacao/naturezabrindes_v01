import { supabase } from './supabase/client.js';

// Teste de conexão do frontend com Supabase
async function testFrontendSupabase() {
  console.log('🔍 Testando conexão do frontend com Supabase...');
  
  try {
    // Verificar se as variáveis de ambiente estão carregadas
    console.log('📋 Verificando variáveis de ambiente:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'Não definida');
    
    // Testar conexão básica
    console.log('\n🔗 Testando conexão básica...');
    const { data, error } = await supabase
      .from('usuarios_clientes')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return false;
    }
    
    console.log('✅ Conexão bem-sucedida!');
    
    // Testar inserção de usuário de teste
    console.log('\n👤 Testando inserção de usuário...');
    const testUser = {
      nome: 'Teste Frontend',
      email: 'teste.frontend@example.com',
      telefone: '(11) 99999-9999',
      empresa: 'Teste Empresa Frontend'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('usuarios_clientes')
      .insert([testUser])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro na inserção:', insertError);
      return false;
    }
    
    console.log('✅ Usuário inserido com sucesso:', insertData);
    
    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    const { error: deleteError } = await supabase
      .from('usuarios_clientes')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.warn('⚠️ Aviso: Erro ao limpar dados de teste:', deleteError);
    } else {
      console.log('✅ Dados de teste limpos com sucesso');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
    return false;
  }
}

// Executar teste
testFrontendSupabase()
  .then(success => {
    if (success) {
      console.log('\n🎉 Teste do frontend concluído com sucesso!');
    } else {
      console.log('\n💥 Teste do frontend falhou!');
    }
  })
  .catch(error => {
    console.error('💥 Erro fatal no teste:', error);
  });
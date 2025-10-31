import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  // Verificar se as variáveis de ambiente estão definidas
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('📋 Variáveis de ambiente:');
  console.log('SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
  console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Definida' : '❌ Não definida');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis de ambiente do Supabase não estão configuradas!');
    return;
  }
  
  // Teste com chave anônima (ANON_KEY)
  console.log('\n🔑 Testando com ANON_KEY...');
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Teste 1: Contar registros na tabela
    console.log('📊 Tentando contar registros na tabela ecologic_products_site...');
    const { count: countAnon, error: countErrorAnon } = await supabaseAnon
      .from('ecologic_products_site')
      .select('*', { count: 'exact', head: true });
    
    if (countErrorAnon) {
      console.error('❌ Erro ao contar com ANON_KEY:', countErrorAnon);
    } else {
      console.log('✅ Total de registros (ANON_KEY):', countAnon);
    }
    
    // Teste 2: Buscar alguns registros
    console.log('📋 Tentando buscar 5 registros...');
    const { data: dataAnon, error: dataErrorAnon } = await supabaseAnon
      .from('ecologic_products_site')
      .select('id, name, category, description')
      .limit(5);
    
    if (dataErrorAnon) {
      console.error('❌ Erro ao buscar dados com ANON_KEY:', dataErrorAnon);
    } else {
      console.log('✅ Primeiros 5 registros (ANON_KEY):');
      console.log(JSON.stringify(dataAnon, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erro geral com ANON_KEY:', error);
  }
  
  // Teste com chave de serviço (SERVICE_ROLE_KEY) se disponível
  if (supabaseServiceKey) {
    console.log('\n🔑 Testando com SERVICE_ROLE_KEY...');
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      // Teste 1: Contar registros na tabela
      console.log('📊 Tentando contar registros na tabela ecologic_products_site...');
      const { count: countService, error: countErrorService } = await supabaseService
        .from('ecologic_products_site')
        .select('*', { count: 'exact', head: true });
      
      if (countErrorService) {
        console.error('❌ Erro ao contar com SERVICE_ROLE_KEY:', countErrorService);
      } else {
        console.log('✅ Total de registros (SERVICE_ROLE_KEY):', countService);
      }
      
      // Teste 2: Buscar alguns registros
      console.log('📋 Tentando buscar 5 registros...');
      const { data: dataService, error: dataErrorService } = await supabaseService
        .from('ecologic_products_site')
        .select('id, name, category, description')
        .limit(5);
      
      if (dataErrorService) {
        console.error('❌ Erro ao buscar dados com SERVICE_ROLE_KEY:', dataErrorService);
      } else {
        console.log('✅ Primeiros 5 registros (SERVICE_ROLE_KEY):');
        console.log(JSON.stringify(dataService, null, 2));
      }
      
      // Teste 3: Verificar permissões da tabela
      console.log('🔐 Verificando permissões da tabela...');
      const { data: permissions, error: permError } = await supabaseService
        .from('information_schema.role_table_grants')
        .select('grantee, table_name, privilege_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'ecologic_products_site')
        .in('grantee', ['anon', 'authenticated']);
      
      if (permError) {
        console.error('❌ Erro ao verificar permissões:', permError);
      } else {
        console.log('✅ Permissões da tabela:');
        console.log(JSON.stringify(permissions, null, 2));
      }
      
    } catch (error) {
      console.error('❌ Erro geral com SERVICE_ROLE_KEY:', error);
    }
  }
  
  // Teste de conectividade básica
  console.log('\n🌐 Testando conectividade básica...');
  try {
    const { data: healthCheck, error: healthError } = await supabaseAnon
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'ecologic_products_site')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Erro na verificação de conectividade:', healthError);
    } else if (healthCheck && healthCheck.length > 0) {
      console.log('✅ Tabela ecologic_products_site existe no schema public');
    } else {
      console.log('⚠️ Tabela ecologic_products_site não encontrada no schema public');
    }
  } catch (error) {
    console.error('❌ Erro na verificação de conectividade:', error);
  }
  
  console.log('\n🏁 Teste concluído!');
}

// Executar o teste
testSupabaseConnection().catch(console.error);
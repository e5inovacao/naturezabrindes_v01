import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPermissions() {
  console.log('🔍 Verificando permissões da tabela usuarios_clientes...');
  
  try {
    // Verificar permissões das roles
    const { data: permissions, error: permError } = await supabase
      .rpc('sql', {
        query: `
          SELECT grantee, table_name, privilege_type 
          FROM information_schema.role_table_grants 
          WHERE table_schema = 'public' 
            AND table_name = 'usuarios_clientes' 
            AND grantee IN ('anon', 'authenticated') 
          ORDER BY table_name, grantee;
        `
      });
    
    if (permError) {
      console.error('❌ Erro ao verificar permissões:', permError);
    } else {
      console.log('✅ Permissões encontradas:', permissions);
    }
    
    // Verificar políticas RLS
    const { data: policies, error: policyError } = await supabase
      .rpc('sql', {
        query: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
          FROM pg_policies 
          WHERE tablename = 'usuarios_clientes';
        `
      });
    
    if (policyError) {
      console.error('❌ Erro ao verificar políticas RLS:', policyError);
    } else {
      console.log('✅ Políticas RLS encontradas:', policies);
    }
    
    // Testar inserção direta como anon
    console.log('\n🧪 Testando inserção como usuário anônimo...');
    const anonSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    const testUser = {
      nome: 'Teste Permissão',
      telefone: '(11) 99999-9999',
      email: 'teste.permissao@example.com',
      empresa: 'Teste Ltda',
      cnpj: null,
      endereco: null,
      user_id: null,
      consultor_id: null
    };
    
    const { data: insertResult, error: insertError } = await anonSupabase
      .from('usuarios_clientes')
      .insert(testUser)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir como anônimo:', insertError);
      console.error('❌ Código:', insertError.code);
      console.error('❌ Mensagem:', insertError.message);
    } else {
      console.log('✅ Inserção como anônimo bem-sucedida:', insertResult.id);
      
      // Limpar o teste
      await supabase
        .from('usuarios_clientes')
        .delete()
        .eq('id', insertResult.id);
      console.log('🧹 Registro de teste removido');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkPermissions();
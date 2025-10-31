// Script para corrigir a função ensure_client_exists no Supabase
import { supabaseAdmin } from './supabase/server.ts';

async function fixFunction() {
  try {
    console.log('🔧 Corrigindo função ensure_client_exists...');
    
    // SQL para recriar a função com o nome correto da tabela
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION ensure_client_exists(p_email TEXT, p_nome TEXT DEFAULT NULL, p_telefone TEXT DEFAULT NULL, p_empresa TEXT DEFAULT NULL)
      RETURNS UUID AS $$
      DECLARE
          client_id UUID;
      BEGIN
          -- Try to find existing user by email
          SELECT id INTO client_id
          FROM usuarios_clientes
          WHERE email = p_email;
          
          -- If not found, create new user
          IF client_id IS NULL THEN
              INSERT INTO usuarios_clientes (user_id, nome, email, telefone, empresa)
              VALUES (
                  NULL, -- No auth user_id for anonymous quote requests
                  COALESCE(p_nome, 'Cliente'),
                  p_email,
                  p_telefone,
                  p_empresa
              )
              RETURNING id INTO client_id;
          END IF;
          
          RETURN client_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Executar usando uma query raw
    const { data, error } = await supabaseAdmin.rpc('exec', {
      sql: createFunctionSQL
    });
    
    if (error) {
      console.error('❌ Erro ao criar função:', error);
      
      // Tentar uma abordagem alternativa - usar uma função simples para testar
      console.log('🔄 Tentando abordagem alternativa...');
      
      // Vamos testar se conseguimos chamar uma função SQL diretamente
      const testResult = await supabaseAdmin
        .from('usuarios_clientes')
        .select('id')
        .eq('email', 'teste@teste.com')
        .limit(1);
      
      console.log('✅ Teste de consulta funcionou:', testResult.error ? 'ERRO' : 'OK');
      
      if (testResult.error) {
        console.error('Erro na consulta:', testResult.error);
      }
      
    } else {
      console.log('✅ Função ensure_client_exists criada com sucesso!');
      
      // Testar a função
      const testEmail = `teste_${Date.now()}@email.com`;
      const { data: functionResult, error: functionError } = await supabaseAdmin
        .rpc('ensure_client_exists', {
          p_email: testEmail,
          p_nome: 'Teste Usuario',
          p_telefone: '(11) 99999-9999',
          p_empresa: 'Teste Empresa'
        });
      
      if (functionError) {
        console.error('❌ Erro ao testar função:', functionError);
      } else {
        console.log('✅ Função testada com sucesso! ID:', functionResult);
        
        // Limpar o usuário teste
        await supabaseAdmin
          .from('usuarios_clientes')
          .delete()
          .eq('id', functionResult);
        
        console.log('🧹 Usuário teste removido');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

fixFunction();
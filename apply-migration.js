// Script para aplicar a migração fix_ensure_client_function.sql manualmente
import { supabaseAdmin } from './supabase/server.ts';

async function applyMigration() {
  try {
    console.log('🔧 Aplicando migração para corrigir ensure_client_exists...');
    
    // Vamos testar diretamente se conseguimos acessar a tabela usuarios_clientes (plural)
    console.log('1️⃣ Verificando se a tabela usuarios_clientes existe...');
    const { data: existingUsers, error: tableError } = await supabaseAdmin
      .from('usuarios_clientes')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erro ao acessar tabela usuarios_clientes:', tableError);
      return;
    }
    
    console.log('✅ Tabela usuarios_clientes acessível');
    console.log('📋 Usuários existentes:', existingUsers?.length || 0);
    
    // Agora vamos tentar inserir um usuário teste para ver qual erro específico ocorre
    console.log('2️⃣ Testando inserção com email...');
    const testEmail = `teste_${Date.now()}@email.com`;
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('usuarios_clientes')
      .insert({
        nome: 'Teste Usuario',
        email: testEmail,
        telefone: '(11) 99999-9999',
        empresa: 'Teste Empresa'
      })
      .select()
      .single();
    
    let hasEmailColumn = true;
    
    if (insertError) {
      console.error('❌ Erro ao inserir usuário teste:', insertError);
      if (insertError.message && insertError.message.includes('email')) {
        hasEmailColumn = false;
        console.log('⚠️ Confirmado: A coluna email não existe na tabela usuarios_clientes!');
      }
    } else {
      console.log('✅ Usuário teste inserido com sucesso:', insertData.id);
      
      // Limpar o usuário teste
      await supabaseAdmin
        .from('usuarios_cliente')
        .delete()
        .eq('id', insertData.id);
      
      console.log('🧹 Usuário teste removido');
    }
    
    if (!hasEmailColumn) {
      console.log('⚠️ Coluna email não existe. Isso explica o erro!');
      console.log('💡 A tabela usuarios_clientes precisa da coluna email para funcionar corretamente.');
      console.log('🔧 Você precisa executar manualmente no Supabase SQL Editor:');
      console.log('   ALTER TABLE usuarios_clientes ADD COLUMN email VARCHAR(255);');
      console.log('   CREATE UNIQUE INDEX usuarios_clientes_email_idx ON usuarios_clientes(email) WHERE email IS NOT NULL;');
    } else {
      console.log('✅ Coluna email já existe!');
    }
    
    
    // Verificar se a função ensure_client_exists existe
    console.log('3️⃣ Verificando função ensure_client_exists...');
    
    if (hasEmailColumn) {
      console.log('✅ Coluna email confirmada como existente!');
      
      // Testar a função ensure_client_exists se ela existir
      try {
        const { data: functionResult, error: functionError } = await supabaseAdmin
          .rpc('ensure_client_exists', {
            p_email: testEmail,
            p_nome: 'Teste Usuario',
            p_telefone: '(11) 99999-9999',
            p_empresa: 'Teste Empresa'
          });
        
        if (functionError) {
          console.error('❌ Erro ao testar função ensure_client_exists:', functionError);
        } else {
          console.log('✅ Função ensure_client_exists funcionando:', functionResult);
        }
      } catch (error) {
        console.log('⚠️ Função ensure_client_exists não existe ou tem erro:', error.message);
      }
    }
    
    console.log('\n📋 RESUMO:');
    console.log(`   - Coluna email: ${hasEmailColumn ? '✅ Existe' : '❌ Não existe'}`);
    console.log(`   - Função ensure_client_exists: ${functionInfo && functionInfo.length > 0 ? '✅ Existe' : '❌ Não existe'}`);
    
    if (!hasEmailColumn) {
      console.log('\n🚨 AÇÃO NECESSÁRIA:');
      console.log('   1. Acesse o Supabase Dashboard');
      console.log('   2. Vá para SQL Editor');
      console.log('   3. Execute o conteúdo do arquivo: supabase/migrations/fix_ensure_client_function.sql');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

applyMigration();
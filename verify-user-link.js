// Script para verificar a vinculação user_id entre usuarios_clientes e solicitacao_orcamentos
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

async function verifyUserLinks() {
  console.log('🔍 Verificando vinculação user_id entre tabelas...');
  
  try {
    // Buscar as últimas 5 solicitações de orçamento
    console.log('\n📋 Buscando últimas solicitações de orçamento...');
    const { data: solicitacoes, error: solicitacoesError } = await supabase
      .from('solicitacao_orcamentos')
      .select('solicitacao_id, numero_solicitacao, user_id, nome_cliente, email_cliente, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (solicitacoesError) {
      console.error('❌ Erro ao buscar solicitações:', solicitacoesError);
      return;
    }
    
    console.log(`✅ Encontradas ${solicitacoes?.length || 0} solicitações`);
    
    // Para cada solicitação, verificar se o user_id existe na tabela usuarios_clientes
    for (const solicitacao of solicitacoes || []) {
      console.log(`\n🔍 Verificando solicitação ${solicitacao.numero_solicitacao}:`);
      console.log(`   - ID: ${solicitacao.solicitacao_id}`);
      console.log(`   - Cliente: ${solicitacao.nome_cliente}`);
      console.log(`   - Email: ${solicitacao.email_cliente}`);
      console.log(`   - User ID: ${solicitacao.user_id}`);
      console.log(`   - Data: ${new Date(solicitacao.created_at).toLocaleString('pt-BR')}`);
      
      if (solicitacao.user_id) {
        // Buscar o usuário correspondente
        const { data: usuario, error: usuarioError } = await supabase
          .from('usuarios_clientes')
          .select('id, nome, email, telefone, empresa, created_at')
          .eq('id', solicitacao.user_id)
          .single();
        
        if (usuarioError) {
          console.log(`   ❌ ERRO: User ID ${solicitacao.user_id} não encontrado na tabela usuarios_clientes`);
          console.log(`      Erro: ${usuarioError.message}`);
        } else {
          console.log(`   ✅ VINCULAÇÃO CORRETA:`);
          console.log(`      - Nome: ${usuario.nome}`);
          console.log(`      - Email: ${usuario.email}`);
          console.log(`      - Telefone: ${usuario.telefone}`);
          console.log(`      - Empresa: ${usuario.empresa}`);
          console.log(`      - Cadastrado em: ${new Date(usuario.created_at).toLocaleString('pt-BR')}`);
          
          // Verificar se os dados coincidem
          const nomeCoincide = usuario.nome === solicitacao.nome_cliente;
          const emailCoincide = usuario.email === solicitacao.email_cliente;
          
          console.log(`      - Nome coincide: ${nomeCoincide ? '✅' : '❌'}`);
          console.log(`      - Email coincide: ${emailCoincide ? '✅' : '❌'}`);
        }
      } else {
        console.log(`   ⚠️  ATENÇÃO: Solicitação sem user_id (campo nulo)`);
      }
    }
    
    // Verificar se há solicitações sem user_id
    console.log('\n🔍 Verificando solicitações sem user_id...');
    const { data: solicitacoesSemUser, error: semUserError } = await supabase
      .from('solicitacao_orcamentos')
      .select('solicitacao_id, numero_solicitacao, nome_cliente, email_cliente, created_at')
      .is('user_id', null)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (semUserError) {
      console.error('❌ Erro ao buscar solicitações sem user_id:', semUserError);
    } else {
      console.log(`📊 Encontradas ${solicitacoesSemUser?.length || 0} solicitações sem user_id`);
      
      if (solicitacoesSemUser && solicitacoesSemUser.length > 0) {
        console.log('⚠️  Solicitações sem vinculação de usuário:');
        solicitacoesSemUser.forEach(sol => {
          console.log(`   - ${sol.numero_solicitacao}: ${sol.nome_cliente} (${sol.email_cliente})`);
        });
      }
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

verifyUserLinks().then(() => {
  console.log('\n🎉 Verificação de vinculação concluída!');
});
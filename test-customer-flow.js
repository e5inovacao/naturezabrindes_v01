// Teste do fluxo de cadastro de cliente
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Criar cliente Supabase para teste
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função que replica a lógica do getOrCreateUser
async function testGetOrCreateUser(customerData) {
  console.log('\n👤 TESTANDO getOrCreateUser...');
  console.log('👤 Dados recebidos:', JSON.stringify(customerData, null, 2));
  
  try {
    // Buscar por email primeiro
    console.log('📧 Buscando usuário por email:', customerData.email);
    const { data: existingUserByEmail, error: emailSearchError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('email', customerData.email)
      .single();

    if (emailSearchError && emailSearchError.code !== 'PGRST116') {
      console.error('❌ Erro na busca por email:', emailSearchError.message);
      throw emailSearchError;
    }

    if (existingUserByEmail) {
      console.log('✅ Usuário encontrado por email:', existingUserByEmail.nome);
      return existingUserByEmail;
    }

    // Buscar por telefone se não encontrou por email
    console.log('📞 Buscando usuário por telefone:', customerData.phone);
    const { data: existingUserByPhone, error: phoneSearchError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('telefone', customerData.phone)
      .single();

    if (phoneSearchError && phoneSearchError.code !== 'PGRST116') {
      console.error('❌ Erro na busca por telefone:', phoneSearchError.message);
      throw phoneSearchError;
    }

    if (existingUserByPhone) {
      console.log('✅ Usuário encontrado por telefone:', existingUserByPhone.nome);
      return existingUserByPhone;
    }

    // Criar novo usuário
    console.log('➕ Criando novo usuário...');
    const newUserData = {
      nome: customerData.name,
      email: customerData.email,
      telefone: customerData.phone,
      empresa: customerData.company || null,
      cnpj: customerData.cnpj || null,
      endereco: JSON.stringify({
        rua: customerData.address,
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      }),
      user_id: null // Para usuários não autenticados
    };

    console.log('📊 Dados para inserção:', JSON.stringify(newUserData, null, 2));

    const { data: newUser, error: insertError } = await supabase
      .from('usuarios_clientes')
      .insert([newUserData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar usuário:', insertError.message);
      throw insertError;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log('🆔 ID do usuário:', newUser.id);
    console.log('👤 Nome:', newUser.nome);
    
    return newUser;

  } catch (error) {
    console.error('❌ Erro em getOrCreateUser:', error.message);
    throw error;
  }
}

// Função que testa a criação de orçamento
async function testCreateQuoteRequest(user, items, observations) {
  console.log('\n📄 TESTANDO createQuoteRequest...');
  
  try {
    // Calcular valor total
    const totalValue = items.reduce((sum, item) => {
      return sum + (item.quantity * (item.unitPrice || 0));
    }, 0);

    console.log('💰 Valor total calculado:', totalValue);

    // Gerar número da solicitação
    const numeroSolicitacao = `SOL-${Date.now()}`;

    // Criar orçamento (apenas campos que existem na tabela)
    const quoteData = {
      user_id: user.id, // Usar o ID do usuário criado
      observacoes: observations,
      valor_total_estimado: totalValue,
      numero_solicitacao: numeroSolicitacao,
      status: 'pendente'
    };

    console.log('📊 Dados do orçamento:', JSON.stringify(quoteData, null, 2));

    const { data: newQuote, error: quoteError } = await supabase
      .from('solicitacao_orcamentos')
      .insert([quoteData])
      .select()
      .single();

    if (quoteError) {
      console.error('❌ Erro ao criar orçamento:', quoteError.message);
      throw quoteError;
    }

    console.log('✅ Orçamento criado com sucesso!');
    console.log('🆔 ID do orçamento:', newQuote.solicitacao_id);
    console.log('📋 Número da solicitação:', newQuote.numero_solicitacao);
    console.log('👤 User ID vinculado:', newQuote.user_id);
    
    return newQuote;

  } catch (error) {
    console.error('❌ Erro em createQuoteRequest:', error.message);
    throw error;
  }
}

// Função principal de teste
async function testCustomerFlow() {
  console.log('🧪 TESTANDO FLUXO COMPLETO DE CADASTRO DE CLIENTE...');
  
  // Usar timestamp para evitar conflitos
  const timestamp = Date.now();
  const customerData = {
    name: `João Silva Teste ${timestamp}`,
    phone: `119998877${timestamp.toString().slice(-2)}`,
    email: `joao.teste.${timestamp}@email.com`,
    company: 'Empresa Teste LTDA',
    cnpj: '12.345.678/0001-90',
    address: 'Rua Teste, 123'
  };
  
  const items = [{
    id: 'test-1',
    name: 'Produto Teste',
    quantity: 2,
    unitPrice: 50,
    ecologicalId: 'ECO001'
  }];
  
  const observations = 'Teste de orçamento - verificação do fluxo completo';
  
  try {
    // Passo 1: Criar/buscar usuário
    const user = await testGetOrCreateUser(customerData);
    
    // Passo 2: Criar orçamento
    const quote = await testCreateQuoteRequest(user, items, observations);
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('👤 Cliente ID:', user.id);
    console.log('📄 Orçamento ID:', quote.solicitacao_id);
    console.log('🔗 Vinculação user_id:', quote.user_id === user.id ? '✅ CORRETO' : '❌ INCORRETO');
    
    return { user, quote };
    
  } catch (error) {
    console.error('❌ ERRO NO FLUXO COMPLETO:', error.message);
    console.error('📊 Stack trace:', error.stack);
    throw error;
  }
}

// Executar o teste
testCustomerFlow().then((result) => {
  console.log('\n🏁 Teste finalizado com sucesso!');
  console.log('📊 Resultado final:', JSON.stringify(result, null, 2));
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Erro fatal no teste:', err.message);
  process.exit(1);
});
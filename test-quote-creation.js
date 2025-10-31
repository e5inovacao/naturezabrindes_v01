import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simular dados de um novo cliente
const newCustomerData = {
  name: 'Maria Santos Teste',
  phone: '(11) 88888-8888',
  email: 'maria.teste@email.com',
  company: 'Nova Empresa LTDA',
  cnpj: '98.765.432/0001-10',
  address: {
    rua: 'Rua Nova, 456',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    cep: '20000-000'
  }
};

// Simular itens do carrinho
const cartItems = [
  {
    id: 1,
    name: 'Produto Teste 1',
    quantity: 10,
    observations: 'Cor azul'
  },
  {
    id: 2,
    name: 'Produto Teste 2',
    quantity: 5,
    observations: 'Personalização especial'
  }
];

async function simulateGetOrCreateUser(customerData) {
  console.log('\n👤 === SIMULANDO getOrCreateUser ===');
  console.log('Dados do cliente:', JSON.stringify(customerData, null, 2));
  
  try {
    // 1. Verificar autenticação (simulando usuário não autenticado)
    console.log('🔐 Usuário não autenticado - prosseguindo como anônimo');
    
    // 2. Buscar usuário existente por email
    console.log('\n📧 Buscando usuário por email...');
    const { data: existingByEmail, error: emailError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('email', customerData.email)
      .single();
    
    if (emailError && emailError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar por email:', emailError);
      throw emailError;
    }
    
    if (existingByEmail) {
      console.log('✅ Usuário encontrado por email:', existingByEmail.id);
      return existingByEmail;
    }
    
    console.log('ℹ️ Nenhum usuário encontrado por email');
    
    // 3. Buscar usuário existente por telefone
    console.log('\n📱 Buscando usuário por telefone...');
    const { data: existingByPhone, error: phoneError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('telefone', customerData.phone)
      .single();
    
    if (phoneError && phoneError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar por telefone:', phoneError);
      throw phoneError;
    }
    
    if (existingByPhone) {
      console.log('✅ Usuário encontrado por telefone:', existingByPhone.id);
      return existingByPhone;
    }
    
    console.log('ℹ️ Nenhum usuário encontrado por telefone');
    
    // 4. Criar novo usuário
    console.log('\n➕ Criando novo usuário...');
    const newUserData = {
      user_id: null, // Usuário não autenticado
      nome: customerData.name,
      telefone: customerData.phone,
      email: customerData.email,
      empresa: customerData.company,
      cnpj: customerData.cnpj,
      endereco: customerData.address,
      consultor_id: null
    };
    
    console.log('Dados para inserção:', JSON.stringify(newUserData, null, 2));
    
    const { data: newUser, error: createError } = await supabase
      .from('usuarios_clientes')
      .insert([newUserData])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError);
      throw createError;
    }
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('Novo usuário:', newUser);
    return newUser;
    
  } catch (error) {
    console.error('❌ Erro em getOrCreateUser:', error);
    throw error;
  }
}

async function simulateCreateQuoteRequest(customerData, items) {
  console.log('\n📋 === SIMULANDO createQuoteRequest ===');
  
  let createdUserId = null;
  let createdQuoteId = null;
  
  try {
    // 1. Criar ou buscar usuário
    console.log('\n1️⃣ Obtendo usuário...');
    const user = await simulateGetOrCreateUser(customerData);
    createdUserId = user.id;
    console.log('✅ Usuário obtido - ID:', createdUserId);
    
    // 2. Criar solicitação de orçamento
    console.log('\n2️⃣ Criando solicitação de orçamento...');
    const quoteData = {
      user_id: createdUserId,
      nome_cliente: customerData.name,
      email_cliente: customerData.email,
      telefone_cliente: customerData.phone,
      empresa_cliente: customerData.company,
      cnpj_cliente: customerData.cnpj,
      endereco_cliente: JSON.stringify(customerData.address),
      observacoes: 'Orçamento de teste - simulação completa',
      status: 'pendente'
    };
    
    console.log('Dados do orçamento:', JSON.stringify(quoteData, null, 2));
    
    const { data: quoteResult, error: quoteError } = await supabase
      .from('solicitacao_orcamentos')
      .insert(quoteData)
      .select();

    if (quoteError) {
      throw quoteError;
    }

    console.log('✅ Orçamento criado - Resultado:', quoteResult);
    const createdQuote = quoteResult[0];
    console.log('✅ Orçamento criado - ID:', createdQuote?.solicitacao_id);
    
    createdQuoteId = createdQuote.id;
    const newQuote = createdQuote;
    
    // 3. Criar itens do orçamento
    console.log('\n3️⃣ Criando itens do orçamento...');
    const itemsData = [
       {
         products_id: '04198', // SACOLA DE ALGODÃO
         products_quantidade_01: 10,
         color: 'azul',
         customizations: 'Personalização teste 1'
       },
       {
         products_id: '14981', // PORTA OBJETOS
         products_quantidade_01: 5,
         color: 'vermelho',
         customizations: 'Personalização teste 2'
       }
     ];
    
    console.log('Dados dos itens:', JSON.stringify(itemsData, null, 2));
    
    // Primeiro precisamos obter o ID da solicitação criada
     if (!createdQuote || !createdQuote.solicitacao_id) {
       throw new Error('Solicitação de orçamento não foi criada corretamente');
     }
     
     const solicitacaoId = createdQuote.solicitacao_id;
     console.log('ID da solicitação:', solicitacaoId);
    
    const { data: newItems, error: itemsError } = await supabase
      .from('products_solicitacao')
      .insert(itemsData.map(item => ({
        ...item,
        solicitacao_id: solicitacaoId
      })))
      .select();
    
    if (itemsError) {
      console.error('❌ Erro ao criar itens:', itemsError);
      throw itemsError;
    }
    
    console.log('✅ Itens criados:', newItems.length);
    
    // 4. Retornar resultado completo
    const result = {
      ...newQuote,
      items: newItems,
      customer: user
    };
    
    console.log('\n🎉 ORÇAMENTO CRIADO COM SUCESSO!');
    console.log('- Cliente ID:', user.id);
    console.log('- Cliente Nome:', user.nome);
    console.log('- Orçamento ID:', newQuote.id);
    console.log('- Itens:', newItems.length);
    
    return result;
    
  } catch (error) {
    console.error('\n💥 ERRO DURANTE CRIAÇÃO DO ORÇAMENTO:', error);
    
    // Rollback: limpar dados criados
    console.log('\n🔄 Iniciando rollback...');
    
    if (createdQuoteId) {
      console.log('🗑️ Removendo orçamento criado...');
      await supabase
        .from('solicitacao_orcamentos')
        .delete()
        .eq('id', createdQuoteId);
    }
    
    if (createdUserId) {
      console.log('🗑️ Removendo usuário criado...');
      await supabase
        .from('usuarios_clientes')
        .delete()
        .eq('id', createdUserId);
    }
    
    console.log('✅ Rollback concluído');
    throw error;
  }
}

async function runQuoteCreationTest() {
  console.log('🚀 TESTE COMPLETO DE CRIAÇÃO DE ORÇAMENTO');
  console.log('=' .repeat(60));
  
  try {
    const result = await simulateCreateQuoteRequest(newCustomerData, cartItems);
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('=' .repeat(60));
    
    // Verificar se os dados foram realmente salvos
    console.log('\n🔍 Verificando dados salvos...');
    
    const { data: savedUser } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('id', result.customer.id)
      .single();
    
    const { data: savedQuote } = await supabase
      .from('solicitacao_orcamentos')
      .select('*')
      .eq('id', result.id)
      .single();
    
    console.log('👤 Usuário salvo:', savedUser ? '✅ Sim' : '❌ Não');
    console.log('📋 Orçamento salvo:', savedQuote ? '✅ Sim' : '❌ Não');
    
    if (savedUser && savedQuote) {
      console.log('\n🎯 CONCLUSÃO: O sistema está funcionando corretamente!');
      console.log('Os usuários estão sendo salvos na tabela usuarios_clientes.');
    }
    
  } catch (error) {
    console.log('\n' + '=' .repeat(60));
    console.log('❌ TESTE FALHOU!');
    console.log('Erro:', error.message);
    console.log('=' .repeat(60));
  }
}

// Executar teste
runQuoteCreationTest().catch(console.error);
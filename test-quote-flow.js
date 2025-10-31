import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Simular exatamente a função getOrCreateUser
async function getOrCreateUser(userData) {
  console.log('🔍 Iniciando getOrCreateUser com dados:', userData);
  
  try {
    // Validações básicas
    if (!userData.nome || !userData.nome.trim()) {
      throw new Error('Nome é obrigatório');
    }
    
    if (!userData.telefone || !userData.telefone.trim()) {
      throw new Error('Telefone é obrigatório');
    }
    
    // Buscar usuário existente por email
    if (userData.email && userData.email.trim()) {
      console.log('📧 Buscando usuário por email:', userData.email);
      const { data: existingByEmail, error: emailError } = await supabase
        .from('usuarios_clientes')
        .select('*')
        .eq('email', userData.email.trim())
        .maybeSingle();
      
      if (emailError) {
        console.error('❌ Erro ao buscar por email:', emailError);
      } else if (existingByEmail) {
        console.log('✅ Usuário encontrado por email:', existingByEmail.id);
        return existingByEmail;
      }
    }
    
    // Buscar usuário existente por telefone
    console.log('📱 Buscando usuário por telefone:', userData.telefone);
    const { data: existingByPhone, error: phoneError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('telefone', userData.telefone.trim())
      .maybeSingle();
    
    if (phoneError) {
      console.error('❌ Erro ao buscar por telefone:', phoneError);
    } else if (existingByPhone) {
      console.log('✅ Usuário encontrado por telefone:', existingByPhone.id);
      return existingByPhone;
    }
    
    // Criar novo usuário
    console.log('👤 Criando novo usuário...');
    const newUserData = {
      nome: userData.nome.trim(),
      telefone: userData.telefone.trim(),
      email: userData.email ? userData.email.trim() : null,
      empresa: userData.empresa ? userData.empresa.trim() : null,
      cnpj: userData.cnpj ? userData.cnpj.trim() : null,
      endereco: userData.endereco || null,
      user_id: null,
      consultor_id: null
    };
    
    console.log('📝 Dados para inserção:', newUserData);
    
    const { data: newUser, error: insertError } = await supabase
      .from('usuarios_clientes')
      .insert(newUserData)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir usuário:', insertError);
      throw insertError;
    }
    
    console.log('✅ Novo usuário criado:', newUser.id);
    return newUser;
    
  } catch (error) {
    console.error('❌ Erro em getOrCreateUser:', error);
    throw error;
  }
}

// Simular processamento de orçamento
async function processQuoteRequest(user, quoteData) {
  console.log('📋 Processando orçamento para usuário:', user.id);
  
  try {
    const { data: quote, error: quoteError } = await supabase
      .from('solicitacao_orcamentos')
      .insert({
        user_id: user.id,
        produtos: quoteData.produtos,
        observacoes: quoteData.observacoes || null,
        status: 'pendente'
      })
      .select()
      .single();
    
    if (quoteError) {
      console.error('❌ Erro ao criar orçamento:', quoteError);
      throw quoteError;
    }
    
    console.log('✅ Orçamento criado:', quote.id);
    return quote;
    
  } catch (error) {
    console.error('❌ Erro ao processar orçamento:', error);
    throw error;
  }
}

// Teste completo do fluxo
async function testCompleteFlow() {
  console.log('🚀 Iniciando teste completo do fluxo de orçamento\n');
  
  try {
    // Dados de teste
    const userData = {
      nome: 'João Silva Teste',
      telefone: '(11) 98765-4321',
      email: 'joao.teste@example.com',
      empresa: 'Empresa Teste Ltda',
      cnpj: '12.345.678/0001-90',
      endereco: {
        rua: 'Rua Teste, 123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
      }
    };
    
    const quoteData = {
      produtos: [
        {
          codigo: '92414',
          nome: 'Sacola Ecológica',
          quantidade: 100,
          preco: 5.50
        }
      ],
      observacoes: 'Teste de orçamento via script'
    };
    
    // Passo 1: Criar/buscar usuário
    console.log('=== PASSO 1: CRIAR/BUSCAR USUÁRIO ===');
    const user = await getOrCreateUser(userData);
    console.log('✅ Usuário obtido:', user.id);
    
    // Passo 2: Processar orçamento
    console.log('\n=== PASSO 2: PROCESSAR ORÇAMENTO ===');
    const quote = await processQuoteRequest(user, quoteData);
    console.log('✅ Orçamento processado:', quote.id);
    
    // Passo 3: Limpeza (remover dados de teste)
    console.log('\n=== PASSO 3: LIMPEZA ===');
    await supabase.from('solicitacao_orcamentos').delete().eq('id', quote.id);
    await supabase.from('usuarios_clientes').delete().eq('id', user.id);
    console.log('🧹 Dados de teste removidos');
    
    console.log('\n🎉 TESTE COMPLETO REALIZADO COM SUCESSO!');
    
  } catch (error) {
    console.error('\n💥 FALHA NO TESTE:', error);
    console.error('Detalhes:', error.message);
    if (error.code) {
      console.error('Código:', error.code);
    }
  }
}

testCompleteFlow();
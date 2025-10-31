// Teste que simula exatamente o fluxo do Cart.tsx
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase (mesmas variáveis do frontend)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Definida' : 'Não definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simular dados exatos do formulário do Cart.tsx
const formData = {
  name: 'João Silva Teste',
  phone: '(11) 99999-8888',
  email: 'joao.teste.cart@email.com',
  company: 'Empresa Teste Cart Ltda',
  cnpj: '12.345.678/0001-90',
  acceptTerms: true,
  receiveNews: false
};

// Simular itens do carrinho
const cartItems = [
  {
    id: 'ecologic-04198',
    name: 'Produto Teste Cart',
    description: 'Descrição do produto teste',
    color: 'Azul',
    notes: 'Observações do produto',
    opcao1: 100,
    opcao2: 200,
    opcao3: 300,
    quantity: 1,
    unitPrice: 25.50,
    customizations: { personalizacao: 'Logo da empresa' },
    ecologicalId: '04198', // Usando código real que existe na tabela
    selectedColor: 'Azul',
    itemNotes: 'Notas específicas do item'
  }
];

const observations = 'Observações gerais do orçamento de teste';

// Função que simula exatamente o handleSubmitQuote do Cart.tsx
async function simulateHandleSubmitQuote() {
  console.log('🚀 Iniciando simulação do handleSubmitQuote...');
  console.log('📋 Dados do formulário:', formData);
  console.log('🛒 Itens do carrinho:', cartItems);
  
  // Validação dos campos obrigatórios (igual ao Cart.tsx)
  const requiredFields = [];
  
  if (!formData.name || formData.name.trim() === '') {
    requiredFields.push('Nome');
  }
  
  if (!formData.phone || formData.phone.trim() === '') {
    requiredFields.push('Telefone');
  }
  
  if (!formData.company || formData.company.trim() === '') {
    requiredFields.push('Empresa');
  }
  
  if (!formData.acceptTerms) {
    requiredFields.push('Aceitar os termos');
  }
  
  // Se houver campos não preenchidos, mostrar erro
  if (requiredFields.length > 0) {
    const message = `Por favor, preencha os seguintes campos obrigatórios:\n\n• ${requiredFields.join('\n• ')}`;
    console.error('❌ Validação falhou. Campos não preenchidos:', requiredFields);
    console.error(message);
    return false;
  }
  
  console.log('✅ Validação dos campos obrigatórios passou');
  
  try {
    console.log('💾 Criando orçamento completo...');
    
    // Preparar dados do cliente para o orçamento (igual ao Cart.tsx)
    const customerData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      company: formData.company.trim(),
      cnpj: formData.cnpj?.trim() || '',
      address: '' // Não temos campo de endereço no formulário atual
    };
    
    console.log('👤 Dados do cliente preparados:', customerData);
    
    // Simular a chamada para createQuoteRequest
    // Vamos testar cada etapa separadamente
    
    // 1. Testar criação/busca de usuário
    console.log('\n🔍 Etapa 1: Testando criação/busca de usuário...');
    
    // Verificar se usuário já existe por email
    const { data: existingUser, error: searchError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('email', customerData.email)
      .single();
    
    let userId;
    
    if (searchError && searchError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar usuário existente:', searchError);
      throw searchError;
    }
    
    if (existingUser) {
      console.log('✅ Usuário existente encontrado:', existingUser.nome);
      userId = existingUser.id;
    } else {
      console.log('ℹ️ Usuário não encontrado, criando novo...');
      
      // Criar novo usuário
      const { data: newUser, error: createError } = await supabase
        .from('usuarios_clientes')
        .insert([{
          nome: customerData.name,
          email: customerData.email,
          telefone: customerData.phone,
          empresa: customerData.company,
          cnpj: customerData.cnpj || null,
          endereco: customerData.address || null
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError);
        throw createError;
      }
      
      console.log('✅ Novo usuário criado:', newUser.nome);
      userId = newUser.id;
    }
    
    // 2. Testar criação do orçamento
    console.log('\n📋 Etapa 2: Testando criação do orçamento...');
    
    const quoteData = {
      nome_cliente: customerData.name,
      email_cliente: customerData.email,
      telefone_cliente: customerData.phone,
      empresa_cliente: customerData.company,
      cnpj_cliente: customerData.cnpj || null,
      endereco_cliente: customerData.address || null,
      observacoes: observations || null,
      valor_total_estimado: 0, // Será calculado
      status: 'pendente',
      user_id: userId
    };
    
    const { data: quoteResult, error: quoteError } = await supabase
      .from('solicitacao_orcamentos')
      .insert([quoteData])
      .select()
      .single();
    
    if (quoteError) {
      console.error('❌ Erro ao criar orçamento:', quoteError);
      throw quoteError;
    }
    
    console.log('✅ Orçamento criado:', quoteResult.numero_solicitacao);
    
    // 3. Testar inserção dos produtos
    console.log('\n🛍️ Etapa 3: Testando inserção dos produtos...');
    
    const productInserts = cartItems.map(item => ({
      solicitacao_id: quoteResult.solicitacao_id,
      products_id: item.ecologicalId || item.id, // ecologicalId já é string no formato correto
      products_quantidade_01: item.opcao1 || 0,
      products_quantidade_02: item.opcao2 || 0,
      products_quantidade_03: item.opcao3 || 0,
      color: item.selectedColor || item.color || null,
      customizations: item.customizations ? JSON.stringify(item.customizations) : null
    }));
    
    const { data: productsResult, error: productsError } = await supabase
      .from('products_solicitacao')
      .insert(productInserts)
      .select();
    
    if (productsError) {
      console.error('❌ Erro ao inserir produtos:', productsError);
      
      // Rollback: deletar orçamento criado
      console.log('🔄 Fazendo rollback do orçamento...');
      await supabase
        .from('solicitacao_orcamentos')
        .delete()
        .eq('solicitacao_id', quoteResult.solicitacao_id);
      
      throw productsError;
    }
    
    console.log('✅ Produtos inseridos:', productsResult.length);
    
    console.log('\n🎉 Simulação concluída com sucesso!');
    console.log('📊 Resumo:');
    console.log(`- Usuário ID: ${userId}`);
    console.log(`- Orçamento ID: ${quoteResult.solicitacao_id}`);
    console.log(`- Número do orçamento: ${quoteResult.numero_solicitacao}`);
    console.log(`- Produtos inseridos: ${productsResult.length}`);
    
    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    
    // Deletar produtos
    await supabase
      .from('products_solicitacao')
      .delete()
      .eq('solicitacao_id', quoteResult.solicitacao_id);
    
    // Deletar orçamento
    await supabase
      .from('solicitacao_orcamentos')
      .delete()
      .eq('solicitacao_id', quoteResult.solicitacao_id);
    
    // Deletar usuário se foi criado neste teste
    if (!existingUser) {
      await supabase
        .from('usuarios_clientes')
        .delete()
        .eq('id', userId);
    }
    
    console.log('✅ Dados de teste limpos');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro na simulação:', error);
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return false;
  }
}

// Executar teste
simulateHandleSubmitQuote()
  .then(success => {
    if (success) {
      console.log('\n🎉 Teste de simulação do Cart.tsx concluído com SUCESSO!');
      process.exit(0);
    } else {
      console.log('\n💥 Teste de simulação do Cart.tsx FALHOU!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Erro fatal na simulação:', error);
    process.exit(1);
  });
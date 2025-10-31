import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://dntlbhmljceaefycdsbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudGxiaG1samNlYWVmeWNkc2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDU4MDMsImV4cCI6MjA2MzY4MTgwM30.DyBPu5O9C8geyV6pliyIGkhwGegwV_9FQeKQ8prSdHY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simular a função createQuoteRequest do quotesService
async function testCreateQuoteRequest() {
  console.log('🧪 Testando fluxo completo do createQuoteRequest...');
  
  // Dados simulados do formulário (como vem do Cart.tsx)
  const customerData = {
    name: 'João Silva Teste',
    phone: '(11) 98765-4321',
    email: 'joao.teste@exemplo.com',
    company: 'Empresa Teste Ltda',
    cnpj: '12.345.678/0001-90',
    address: ''
  };
  
  // Itens simulados do carrinho
  const items = [
    {
      id: 'produto-teste-1',
      name: 'Produto Teste 1',
      quantity: 10,
      ecologicalId: 'ECO001',
      color: 'Azul',
      customizations: { logo: 'Logo da empresa' }
    }
  ];
  
  const notes = 'Observações de teste';
  
  console.log('📝 Dados do teste:');
  console.log('👤 Cliente:', customerData);
  console.log('🛍️ Itens:', items);
  console.log('📋 Observações:', notes);
  
  try {
    // Etapa 1: Verificar/criar usuário
    console.log('\n👤 Etapa 1: Verificando se usuário já existe...');
    
    // Buscar por email
    const { data: existingUserByEmail, error: emailError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('email', customerData.email)
      .maybeSingle();
    
    if (emailError && emailError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar por email:', emailError);
      return;
    }
    
    // Buscar por telefone
    const { data: existingUserByPhone, error: phoneError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('telefone', customerData.phone)
      .maybeSingle();
    
    if (phoneError && phoneError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar por telefone:', phoneError);
      return;
    }
    
    let user = existingUserByEmail || existingUserByPhone;
    let createdUserId = null;
    
    if (user) {
      console.log('✅ Usuário encontrado:', user.id);
      
      // Atualizar dados se necessário
      const updateData = {
        nome: customerData.name,
        email: customerData.email,
        telefone: customerData.phone,
        empresa: customerData.company,
        cnpj: customerData.cnpj || null
      };
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('usuarios_clientes')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError);
        return;
      }
      
      user = updatedUser;
      console.log('✅ Usuário atualizado com sucesso');
      
    } else {
      console.log('ℹ️ Usuário não encontrado, criando novo...');
      
      const newUserData = {
        nome: customerData.name,
        email: customerData.email,
        telefone: customerData.phone,
        empresa: customerData.company,
        cnpj: customerData.cnpj || null
      };
      
      console.log('📝 Dados para criação:', newUserData);
      
      const { data: newUser, error: createError } = await supabase
        .from('usuarios_clientes')
        .insert(newUserData)
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erro ao criar usuário:');
        console.error('❌ Código:', createError.code);
        console.error('❌ Mensagem:', createError.message);
        console.error('❌ Detalhes:', createError.details);
        console.error('❌ Hint:', createError.hint);
        return;
      }
      
      if (!newUser) {
        console.error('❌ Usuário foi criado mas não retornou dados');
        return;
      }
      
      user = newUser;
      createdUserId = newUser.id;
      console.log('✅ Usuário criado com sucesso:', user.id);
    }
    
    // Etapa 2: Criar orçamento
    console.log('\n📄 Etapa 2: Criando orçamento...');
    
    const valorTotal = items.reduce((total, item) => {
      const unitPrice = 15.50; // Preço simulado
      return total + (unitPrice * item.quantity);
    }, 0);
    
    const quoteData = {
      nome_cliente: customerData.name,
      email_cliente: customerData.email,
      telefone_cliente: customerData.phone,
      empresa_cliente: customerData.company || null,
      endereco_cliente: customerData.address || null,
      observacoes: notes || null,
      valor_total_estimado: valorTotal,
      status: 'pendente',
      user_id: user.id,
      consultor_id: 24
    };
    
    console.log('📝 Dados do orçamento:', quoteData);
    
    const { data: newQuote, error: quoteError } = await supabase
      .from('solicitacao_orcamentos')
      .insert(quoteData)
      .select()
      .single();
    
    if (quoteError) {
      console.error('❌ Erro ao criar orçamento:');
      console.error('❌ Código:', quoteError.code);
      console.error('❌ Mensagem:', quoteError.message);
      console.error('❌ Detalhes:', quoteError.details);
      
      // Rollback do usuário se foi criado
      if (createdUserId) {
        console.log('🔄 Fazendo rollback do usuário...');
        await supabase.from('usuarios_clientes').delete().eq('id', createdUserId);
      }
      return;
    }
    
    if (!newQuote) {
      console.error('❌ Orçamento foi criado mas não retornou dados');
      return;
    }
    
    console.log('✅ Orçamento criado com sucesso:', newQuote.solicitacao_id);
    
    // Etapa 3: Limpar dados de teste
    console.log('\n🧹 Etapa 3: Limpando dados de teste...');
    
    // Remover orçamento
    await supabase.from('solicitacao_orcamentos').delete().eq('solicitacao_id', newQuote.solicitacao_id);
    
    // Remover usuário se foi criado no teste
    if (createdUserId) {
      await supabase.from('usuarios_clientes').delete().eq('id', createdUserId);
    }
    
    console.log('✅ Dados de teste limpos com sucesso');
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testCreateQuoteRequest().then(() => {
  console.log('\n🏁 Teste do fluxo completo concluído');
}).catch(error => {
  console.error('❌ Erro fatal no teste:', error);
});
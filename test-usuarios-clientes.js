import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Definida' : '❌ Não definida');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Definida' : '❌ Não definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados de teste
const testUserData = {
  nome: 'João Silva Teste',
  telefone: '(11) 99999-9999',
  email: 'joao.teste@email.com',
  empresa: 'Empresa Teste LTDA',
  cnpj: '12.345.678/0001-90',
  endereco: {
    rua: 'Rua Teste, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567'
  },
  consultor_id: null
};

async function testDirectInsert() {
  console.log('\n🔍 TESTE 1: Inserção direta na tabela usuarios_clientes');
  console.log('Dados de teste:', JSON.stringify(testUserData, null, 2));
  
  try {
    const { data, error } = await supabase
      .from('usuarios_clientes')
      .insert([testUserData])
      .select();
    
    if (error) {
      console.error('❌ Erro na inserção direta:', error);
      console.error('Código do erro:', error.code);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
      console.error('Message:', error.message);
      return false;
    }
    
    console.log('✅ Inserção direta bem-sucedida!');
    console.log('Dados inseridos:', data);
    return data[0];
  } catch (err) {
    console.error('❌ Exceção durante inserção direta:', err);
    return false;
  }
}

async function checkRLSPolicies() {
  console.log('\n🔍 TESTE 2: Verificação das políticas RLS');
  
  try {
    // Verificar se conseguimos ler a tabela
    const { data, error } = await supabase
      .from('usuarios_clientes')
      .select('id, nome, email')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao ler tabela usuarios_clientes:', error);
      return false;
    }
    
    console.log('✅ Leitura da tabela permitida');
    console.log('Registros encontrados:', data?.length || 0);
    
    // Verificar permissões de inserção
    const testInsert = {
      nome: 'Teste RLS',
      email: 'teste.rls@email.com'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('usuarios_clientes')
      .insert([testInsert])
      .select();
    
    if (insertError) {
      console.error('❌ Erro de permissão na inserção:', insertError);
      return false;
    }
    
    console.log('✅ Inserção permitida pelas políticas RLS');
    
    // Limpar dados de teste
    if (insertData && insertData[0]) {
      await supabase
        .from('usuarios_clientes')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Dados de teste removidos');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Exceção durante verificação RLS:', err);
    return false;
  }
}

async function testGetOrCreateUser() {
  console.log('\n🔍 TESTE 3: Função getOrCreateUser');
  
  // Simular a lógica da função getOrCreateUser
  const customerData = {
    name: testUserData.nome,
    phone: testUserData.telefone,
    email: testUserData.email,
    company: testUserData.empresa,
    cnpj: testUserData.cnpj,
    address: testUserData.endereco
  };
  
  console.log('Dados do cliente:', JSON.stringify(customerData, null, 2));
  
  try {
    // 1. Buscar usuário existente por email
    console.log('\n📧 Buscando usuário por email...');
    const { data: existingByEmail, error: emailError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('email', customerData.email)
      .single();
    
    if (emailError && emailError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar por email:', emailError);
    } else if (existingByEmail) {
      console.log('✅ Usuário encontrado por email:', existingByEmail.id);
      return existingByEmail;
    } else {
      console.log('ℹ️ Nenhum usuário encontrado por email');
    }
    
    // 2. Buscar usuário existente por telefone
    console.log('\n📱 Buscando usuário por telefone...');
    const { data: existingByPhone, error: phoneError } = await supabase
      .from('usuarios_clientes')
      .select('*')
      .eq('telefone', customerData.phone)
      .single();
    
    if (phoneError && phoneError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar por telefone:', phoneError);
    } else if (existingByPhone) {
      console.log('✅ Usuário encontrado por telefone:', existingByPhone.id);
      return existingByPhone;
    } else {
      console.log('ℹ️ Nenhum usuário encontrado por telefone');
    }
    
    // 3. Criar novo usuário
    console.log('\n➕ Criando novo usuário...');
    const newUserData = {
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
      console.error('Código:', createError.code);
      console.error('Detalhes:', createError.details);
      console.error('Hint:', createError.hint);
      return false;
    }
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('Novo usuário:', newUser);
    return newUser;
    
  } catch (err) {
    console.error('❌ Exceção durante getOrCreateUser:', err);
    return false;
  }
}

async function checkTableStructure() {
  console.log('\n🔍 TESTE 4: Verificação da estrutura da tabela');
  
  try {
    // Tentar inserir com campos obrigatórios apenas
    const minimalData = {
      nome: 'Teste Estrutura'
    };
    
    const { data, error } = await supabase
      .from('usuarios_clientes')
      .insert([minimalData])
      .select();
    
    if (error) {
      console.error('❌ Erro com dados mínimos:', error);
      
      // Verificar se é problema de campo obrigatório
      if (error.message.includes('null value')) {
        console.log('ℹ️ Possível campo obrigatório faltando');
      }
      
      return false;
    }
    
    console.log('✅ Inserção com dados mínimos bem-sucedida');
    
    // Limpar dados de teste
    if (data && data[0]) {
      await supabase
        .from('usuarios_clientes')
        .delete()
        .eq('id', data[0].id);
      console.log('🧹 Dados de teste removidos');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Exceção durante verificação de estrutura:', err);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 INICIANDO TESTES DA TABELA USUARIOS_CLIENTES');
  console.log('=' .repeat(60));
  
  const results = {
    directInsert: false,
    rlsPolicies: false,
    getOrCreateUser: false,
    tableStructure: false
  };
  
  // Executar todos os testes
  results.tableStructure = await checkTableStructure();
  results.rlsPolicies = await checkRLSPolicies();
  results.directInsert = await testDirectInsert();
  results.getOrCreateUser = await testGetOrCreateUser();
  
  // Resumo dos resultados
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMO DOS TESTES:');
  console.log('=' .repeat(60));
  
  console.log(`Estrutura da tabela: ${results.tableStructure ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Políticas RLS: ${results.rlsPolicies ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Inserção direta: ${results.directInsert ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Função getOrCreateUser: ${results.getOrCreateUser ? '✅ OK' : '❌ FALHOU'}`);
  
  const allPassed = Object.values(results).every(result => result !== false);
  
  console.log('\n' + '=' .repeat(60));
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('A tabela usuarios_clientes está funcionando corretamente.');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM!');
    console.log('Verifique os erros acima para identificar o problema.');
  }
  console.log('=' .repeat(60));
}

// Executar testes
runAllTests().catch(console.error);
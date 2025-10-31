// Script para testar o cadastro de um novo usuário
import fetch from 'node-fetch';

// Gerar dados únicos para um novo usuário
const timestamp = Date.now();
const uniqueEmail = `novo.usuario.${timestamp}@teste.com`;
const uniqueName = `Novo Usuário ${timestamp}`;

const testData = {
  customerInfo: {
    name: uniqueName,
    email: uniqueEmail,
    phone: '(11) 88888-8888',
    company: 'Nova Empresa Teste Ltda',
    cnpj: '12.345.678/0001-90',
    address: 'Rua Nova, 123 - São Paulo, SP'
  },
  items: [
    {
      id: 'new-test-1',
      name: 'Produto Novo Teste 1',
      quantity: 2
    },
    {
      id: 'new-test-2', 
      name: 'Produto Novo Teste 2',
      quantity: 1
    }
  ],
  notes: 'Teste de cadastro de novo usuário via script'
};

console.log('🧪 TESTANDO CADASTRO DE NOVO USUÁRIO...');
console.log('🧪 Timestamp:', new Date().toISOString());
console.log('📧 Email único:', uniqueEmail);
console.log('👤 Nome único:', uniqueName);

try {
  const response = await fetch('http://localhost:3005/api/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
  });

  console.log('📡 Status da resposta:', response.status);
  console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));
  
  const responseText = await response.text();
  console.log('📡 Resposta bruta:', responseText);
  
  if (response.ok) {
    const result = JSON.parse(responseText);
    console.log('✅ SUCESSO! Novo usuário cadastrado e orçamento criado:');
    console.log(JSON.stringify(result, null, 2));
    
    // Verificar se o usuário foi realmente criado
    console.log('\n🔍 Dados do cliente criado:');
    console.log('- Nome:', result.data.customerInfo.name);
    console.log('- Email:', result.data.customerInfo.email);
    console.log('- Telefone:', result.data.customerInfo.phone);
    console.log('- Empresa:', result.data.customerInfo.company);
    console.log('- CNPJ:', result.data.customerInfo.cnpj);
    
    console.log('\n📋 Orçamento criado:');
    console.log('- ID:', result.data.id);
    console.log('- Status:', result.data.status);
    console.log('- Itens:', result.data.items.length);
    
  } else {
    const errorResult = JSON.parse(responseText);
    console.log('❌ ERRO na requisição:', errorResult);
  }
} catch (error) {
  console.error('❌ ERRO na requisição:', error.message);
}
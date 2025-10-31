// Teste simples para verificar se a API está funcionando
const testData = {
  customerData: {
    name: 'João Silva Teste',
    email: 'joao.teste@email.com',
    phone: '11999999999',
    company: 'Empresa Teste Ltda',
    address: 'Rua Teste, 123'
  },
  items: [
    {
      id: '1',
      name: 'Produto Teste 1',
      description: 'Descrição do produto teste 1',
      color: 'Azul',
      notes: 'Observações do produto 1',
      opcao1: 100,
      opcao2: 200,
      opcao3: 300,
      quantity: 2,
      unitPrice: 15.50,
      ecologicalId: 123,
      customizations: { personalizacao: 'Logo da empresa' }
    },
    {
      id: '2',
      name: 'Produto Teste 2',
      description: 'Descrição do produto teste 2',
      color: 'Verde',
      notes: 'Observações do produto 2',
      opcao1: 50,
      opcao2: 100,
      opcao3: 150,
      quantity: 1,
      unitPrice: 25.00,
      ecologicalId: 456,
      customizations: { cor: 'personalizada' }
    }
  ],
  notes: 'Teste de integração da tabela products_solicitacao'
};

async function testAPI() {
  try {
    console.log('🧪 Testando API de criação de orçamento...');
    console.log('📋 Dados do teste:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:5173/api/quotes/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Resposta da API:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ Erro no teste da API:', error);
    throw error;
  }
}

// Executar o teste
testAPI()
  .then(result => {
    console.log('🎉 Teste da API finalizado com sucesso!');
  })
  .catch(error => {
    console.error('💥 Teste da API falhou:', error);
  });
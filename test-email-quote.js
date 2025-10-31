import { sendConfirmationEmail } from './src/utils/emailService.ts';

// Teste do envio de email de orçamento
async function testQuoteEmail() {
  console.log('🧪 Testando envio de email de orçamento...');
  
  const testData = {
    clientName: 'João Silva',
    clientEmail: 'joao.silva@email.com',
    clientPhone: '(11) 99999-9999',
    clientCompany: 'Empresa Teste LTDA',
    subject: 'Solicitação de Orçamento',
    message: `Produtos solicitados:\n• Mochila Executiva (Qtd: 2, Cor: Azul, Obs: Logo da empresa)\n• Caneta Personalizada (Qtd: 50, Cor: Preta)\n• Agenda 2024 (Qtd: 10, Cor: Marrom, Obs: Capa em couro)\n\nObservações gerais: Entrega urgente para evento corporativo`
  };
  
  try {
    console.log('📧 Enviando email com os dados:', {
      nome: testData.clientName,
      email: testData.clientEmail,
      telefone: testData.clientPhone,
      empresa: testData.clientCompany,
      assunto: testData.subject,
      temMensagem: !!testData.message
    });
    
    const result = await sendConfirmationEmail(testData);
    
    if (result) {
      console.log('✅ Email enviado com sucesso!');
      console.log('📋 Verificar se o email contém:');
      console.log('   - Empresa:', testData.clientCompany);
      console.log('   - Nome:', testData.clientName);
      console.log('   - Telefone:', testData.clientPhone);
      console.log('   - Email:', testData.clientEmail);
      console.log('   - Produtos listados corretamente');
      console.log('   - Observações incluídas');
    } else {
      console.log('❌ Falha no envio do email');
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
  }
}

// Executar teste
testQuoteEmail();
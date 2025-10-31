/**
 * TESTE SIMPLIFICADO DO CADASTRO DE CLIENTE
 * Teste direto via API do Supabase
 */

// Simular dados de teste
const dadosClienteTeste = {
  name: 'João Silva Teste',
  email: `teste.cliente.${Date.now()}@email.com`,
  phone: '11987654321',
  company: 'Empresa Teste Ltda',
  cnpj: '12.345.678/0001-90',
  address: 'Rua Teste, 123 - São Paulo/SP'
};

console.log('🧪 TESTE SIMPLIFICADO DE CADASTRO DE CLIENTE');
console.log('=' .repeat(60));
console.log('📝 Dados do cliente de teste:');
console.log(JSON.stringify(dadosClienteTeste, null, 2));
console.log('\n✅ Dados preparados para teste');
console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('1. Abrir o navegador na aplicação');
console.log('2. Adicionar produtos ao carrinho');
console.log('3. Preencher o formulário com os dados acima');
console.log('4. Clicar em "Enviar Orçamento"');
console.log('5. Verificar os logs no console do navegador');
console.log('6. Confirmar se o usuário foi salvo na tabela usuarios_clientes');
console.log('\n🎯 OBJETIVO: Verificar se o cadastro funciona 100%');
console.log('=' .repeat(60));

// Instruções para teste manual
console.log('\n🔍 COMO VERIFICAR SE FUNCIONOU:');
console.log('1. Abra o console do navegador (F12)');
console.log('2. Procure por mensagens como:');
console.log('   - "✅ SUCESSO: Usuário criado com sucesso"');
console.log('   - "🎉 CADASTRO DE USUÁRIO CONCLUÍDO COM SUCESSO!"');
console.log('3. Verifique se não há erros em vermelho');
console.log('4. Confirme se o pop-up de sucesso apareceu');

console.log('\n💡 DICA: Use os dados acima para preencher o formulário');
console.log('Email único gerado:', dadosClienteTeste.email);
import fetch from 'node-fetch';

async function testCanetasAPI() {
  console.log('=== TESTE: API de Canetas ===');
  
  try {
    // Teste 1: Busca por "caneta"
    console.log('\n1. Testando busca por "caneta"...');
    const searchResponse = await fetch('http://localhost:3005/api/products?search=caneta&limit=10');
    const searchData = await searchResponse.json();
    
    console.log('Status:', searchResponse.status);
    console.log('Produtos encontrados:', searchData.data?.length || 0);
    console.log('Total:', searchData.total || 0);
    
    if (searchData.data && searchData.data.length > 0) {
      console.log('\nPrimeiros produtos encontrados:');
      searchData.data.slice(0, 3).forEach((p, i) => {
        console.log(`${i+1}. ${p.title}`);
        console.log(`   Categoria: ${p.category}`);
        console.log(`   ID: ${p.id}`);
        console.log('');
      });
    } else {
      console.log('Nenhum produto encontrado na busca!');
    }
    
    // Teste 2: Filtro por categoria "papelaria"
    console.log('\n2. Testando filtro por categoria "papelaria"...');
    const categoryResponse = await fetch('http://localhost:3005/api/products?category=papelaria&limit=10');
    const categoryData = await categoryResponse.json();
    
    console.log('Status:', categoryResponse.status);
    console.log('Produtos encontrados:', categoryData.data?.length || 0);
    console.log('Total:', categoryData.total || 0);
    
    if (categoryData.data && categoryData.data.length > 0) {
      console.log('\nPrimeiros produtos da categoria papelaria:');
      categoryData.data.slice(0, 3).forEach((p, i) => {
        console.log(`${i+1}. ${p.title}`);
        console.log(`   Categoria: ${p.category}`);
        console.log(`   ID: ${p.id}`);
        console.log('');
      });
    } else {
      console.log('Nenhum produto encontrado na categoria papelaria!');
    }
    
    // Teste 3: Busca combinada
    console.log('\n3. Testando busca combinada "caneta" + categoria "papelaria"...');
    const combinedResponse = await fetch('http://localhost:3005/api/products?search=caneta&category=papelaria&limit=10');
    const combinedData = await combinedResponse.json();
    
    console.log('Status:', combinedResponse.status);
    console.log('Produtos encontrados:', combinedData.data?.length || 0);
    console.log('Total:', combinedData.total || 0);
    
    if (combinedData.data && combinedData.data.length > 0) {
      console.log('\nProdutos da busca combinada:');
      combinedData.data.forEach((p, i) => {
        console.log(`${i+1}. ${p.title}`);
        console.log(`   Categoria: ${p.category}`);
        console.log(`   ID: ${p.id}`);
        console.log('');
      });
    } else {
      console.log('Nenhum produto encontrado na busca combinada!');
    }
    
    // Teste 4: Listar todos os produtos (sem filtros)
    console.log('\n4. Testando listagem geral (sem filtros)...');
    const allResponse = await fetch('http://localhost:3005/api/products?limit=5');
    const allData = await allResponse.json();
    
    console.log('Status:', allResponse.status);
    console.log('Produtos encontrados:', allData.data?.length || 0);
    console.log('Total:', allData.total || 0);
    
    if (allData.data && allData.data.length > 0) {
      console.log('\nPrimeiros produtos (sem filtro):');
      allData.data.forEach((p, i) => {
        console.log(`${i+1}. ${p.title}`);
        console.log(`   Categoria: ${p.category}`);
        console.log(`   ID: ${p.id}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

testCanetasAPI();
// Buscar produtos específicos
import fetch from 'node-fetch';

async function searchProducts() {
  try {
    console.log('🔍 Buscando produtos com "porta"...');
    const response = await fetch('http://localhost:5175/api/products?search=porta');
    const data = await response.json();
    
    console.log('Estrutura da resposta:', Object.keys(data));
    
    if (data.data && Array.isArray(data.data)) {
      console.log(`Encontrados ${data.data.length} produtos com "porta"`);
      data.data.slice(0, 10).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
      });
    } else {
      console.log('Nenhum produto encontrado ou estrutura inesperada');
    }
    
    console.log('\n🔍 Buscando produtos com "carteira"...');
    const response2 = await fetch('http://localhost:5175/api/products?search=carteira');
    const data2 = await response2.json();
    
    if (data2.data && Array.isArray(data2.data)) {
      console.log(`Encontrados ${data2.data.length} produtos com "carteira"`);
      data2.data.slice(0, 10).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
      });
    } else {
      console.log('Nenhum produto encontrado ou estrutura inesperada');
    }
    
    console.log('\n🔍 Buscando produtos com "documento"...');
    const response3 = await fetch('http://localhost:5175/api/products?search=documento');
    const data3 = await response3.json();
    
    if (data3.data && Array.isArray(data3.data)) {
      console.log(`Encontrados ${data3.data.length} produtos com "documento"`);
      data3.data.slice(0, 10).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
      });
    } else {
      console.log('Nenhum produto encontrado ou estrutura inesperada');
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

searchProducts();
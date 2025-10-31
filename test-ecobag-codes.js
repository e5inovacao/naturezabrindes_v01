// Teste para verificar se os códigos específicos de ecobags existem na base de dados
import fetch from 'node-fetch';

async function testEcobagCodes() {
  console.log('🔍 Testando códigos específicos de ecobags...');
  
  const ecobagCodes = ['42823', '92093', '92372', '92345', '92341'];
  const baseUrl = 'http://localhost:5175/api/products';
  
  try {
    // Primeiro, buscar todos os produtos para ver o que temos
    console.log('\n📡 Buscando todos os produtos...');
    const allResponse = await fetch(`${baseUrl}?limit=1000`);
    const allData = await allResponse.json();
    
    if (!allData.success) {
      console.error('❌ Erro na API:', allData.error);
      return;
    }
    
    const allProducts = allData.data.items || [];
    console.log(`✅ Total de produtos encontrados: ${allProducts.length}`);
    
    // Verificar se temos produtos com códigos/referências
    const productsWithCodes = allProducts.filter(p => 
      p.supplierCode || p.reference || p.code || p.codigo
    );
    console.log(`📋 Produtos com códigos: ${productsWithCodes.length}`);
    
    if (productsWithCodes.length > 0) {
      console.log('\n🔍 Primeiros 10 produtos com códigos:');
      productsWithCodes.slice(0, 10).forEach((product, index) => {
        const code = product.supplierCode || product.reference || product.code || product.codigo;
        console.log(`   ${index + 1}. Código: ${code} - Nome: ${product.name}`);
      });
    }
    
    // Testar cada código específico
    console.log('\n🎯 Testando códigos específicos de ecobags:');
    for (const code of ecobagCodes) {
      console.log(`\n🔍 Buscando código: ${code}`);
      
      try {
        const response = await fetch(`${baseUrl}?search=${code}&limit=5`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.items) {
          const products = data.data.items;
          console.log(`   ✅ Encontrados ${products.length} produtos`);
          
          products.forEach((product, index) => {
            const productCode = product.supplierCode || product.reference || product.code || product.codigo;
            console.log(`      ${index + 1}. ${product.name} (Código: ${productCode})`);
          });
        } else {
          console.log(`   ❌ Nenhum produto encontrado para código ${code}`);
        }
      } catch (error) {
        console.error(`   ❌ Erro ao buscar código ${code}:`, error.message);
      }
    }
    
    // Buscar por termos relacionados a ecobags
    console.log('\n🌱 Buscando por termos relacionados a ecobags:');
    const ecobagTerms = ['ecobag', 'sacola', 'bolsa', 'bag'];
    
    for (const term of ecobagTerms) {
      try {
        const response = await fetch(`${baseUrl}?search=${term}&limit=10`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.items) {
          const products = data.data.items;
          console.log(`\n🔍 Termo "${term}": ${products.length} produtos encontrados`);
          
          products.slice(0, 5).forEach((product, index) => {
            const code = product.supplierCode || product.reference || product.code || product.codigo;
            console.log(`   ${index + 1}. ${product.name} ${code ? `(Código: ${code})` : '(Sem código)'}`);
          });
        }
      } catch (error) {
        console.error(`   ❌ Erro ao buscar termo ${term}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testEcobagCodes();
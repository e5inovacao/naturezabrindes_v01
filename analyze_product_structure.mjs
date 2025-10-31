import fetch from 'node-fetch';
import fs from 'fs';

async function analyzeProductStructure() {
  console.log('🔍 Analisando estrutura dos produtos...');
  
  try {
    const response = await fetch('http://localhost:3005/api/products?limit=5');
    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }
    
    const data = await response.json();
    const products = data.data?.items || data.products || data.items || data;
    
    if (!Array.isArray(products)) {
      throw new Error('API não retornou array de produtos');
    }
    
    console.log(`\n✅ Encontrados ${products.length} produtos`);
    console.log('\n📋 ESTRUTURA DOS PRODUTOS:');
    console.log('='.repeat(60));
    
    // Analisar estrutura do primeiro produto
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('\n🔍 CAMPOS DO PRIMEIRO PRODUTO:');
      console.log(JSON.stringify(firstProduct, null, 2));
      
      // Listar todos os campos únicos encontrados
      const allFields = new Set();
      const imageFields = new Set();
      const urlFields = new Set();
      
      products.forEach(product => {
        Object.keys(product).forEach(key => {
          allFields.add(key);
          
          // Identificar possíveis campos de imagem
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes('image') || lowerKey.includes('img') || 
              lowerKey.includes('photo') || lowerKey.includes('picture') ||
              lowerKey.includes('imagem') || lowerKey.includes('foto')) {
            imageFields.add(key);
          }
          
          // Identificar campos que podem conter URLs
          const value = product[key];
          if (typeof value === 'string' && 
              (value.startsWith('http://') || value.startsWith('https://') || 
               value.includes('.jpg') || value.includes('.png') || 
               value.includes('.jpeg') || value.includes('.gif') || 
               value.includes('.webp'))) {
            urlFields.add(key);
          }
        });
      });
      
      console.log('\n📝 TODOS OS CAMPOS ENCONTRADOS:');
      console.log(Array.from(allFields).sort().join(', '));
      
      console.log('\n🖼️  POSSÍVEIS CAMPOS DE IMAGEM:');
      if (imageFields.size > 0) {
        console.log(Array.from(imageFields).join(', '));
      } else {
        console.log('❌ Nenhum campo de imagem identificado');
      }
      
      console.log('\n🔗 CAMPOS COM URLs:');
      if (urlFields.size > 0) {
        console.log(Array.from(urlFields).join(', '));
        
        // Mostrar exemplos de URLs encontradas
        console.log('\n📋 EXEMPLOS DE URLs ENCONTRADAS:');
        products.forEach((product, index) => {
          urlFields.forEach(field => {
            if (product[field]) {
              console.log(`Produto ${index + 1} - ${field}: ${product[field]}`);
            }
          });
        });
      } else {
        console.log('❌ Nenhuma URL encontrada nos produtos');
      }
      
      // Verificar se há campos aninhados que podem conter imagens
      console.log('\n🔍 VERIFICANDO CAMPOS ANINHADOS:');
      products.forEach((product, index) => {
        Object.keys(product).forEach(key => {
          const value = product[key];
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            console.log(`\nProduto ${index + 1} - Campo aninhado '${key}':`);
            console.log(JSON.stringify(value, null, 2));
          } else if (Array.isArray(value) && value.length > 0) {
            console.log(`\nProduto ${index + 1} - Array '${key}' (${value.length} itens):`);
            console.log(JSON.stringify(value[0], null, 2));
          }
        });
      });
    }
    
    // Salvar análise completa
    const analysis = {
      timestamp: new Date().toISOString(),
      totalProducts: products.length,
      sampleProducts: products.slice(0, 3),
      allFields: Array.from(new Set(products.flatMap(p => Object.keys(p)))).sort(),
      fieldTypes: {}
    };
    
    // Analisar tipos de dados de cada campo
    analysis.allFields.forEach(field => {
      const types = new Set();
      const samples = [];
      
      products.forEach(product => {
        if (product.hasOwnProperty(field)) {
          const value = product[field];
          types.add(typeof value);
          if (samples.length < 3) {
            samples.push(value);
          }
        }
      });
      
      analysis.fieldTypes[field] = {
        types: Array.from(types),
        samples: samples
      };
    });
    
    const analysisFile = 'product_structure_analysis.json';
    fs.writeFileSync(analysisFile, JSON.stringify(analysis, null, 2));
    console.log(`\n💾 Análise completa salva em: ${analysisFile}`);
    
  } catch (error) {
    console.error('❌ Erro durante a análise:', error.message);
  }
}

// Executar a análise
analyzeProductStructure().catch(console.error);
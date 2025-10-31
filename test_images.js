import fetch from 'node-fetch';
import fs from 'fs';

// Configuração da API
const API_BASE_URL = 'http://localhost:5175/api';

async function testImageUrls() {
  console.log('🔍 Iniciando teste das URLs das imagens dos produtos...');
  console.log('=' .repeat(60));

  try {
    // 1. Fazer consulta à API de produtos
    console.log('📡 Fazendo consulta à API de produtos...');
    const response = await fetch(`${API_BASE_URL}/products?limit=20`);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.data?.items || [];
    
    console.log(`✅ ${products.length} produtos encontrados`);
    console.log('=' .repeat(60));

    // 2. Analisar URLs das imagens
    let totalImages = 0;
    let validUrls = 0;
    let invalidUrls = 0;
    let emptyUrls = 0;
    let brokenUrls = 0;
    const problematicUrls = [];
    const validUrlExamples = [];

    for (const product of products) {
      console.log(`\n🔍 Analisando produto: ${product.name}`);
      console.log(`ID: ${product.id}`);
      
      if (product.images && Array.isArray(product.images)) {
        console.log(`📸 ${product.images.length} imagens encontradas`);
        
        for (let i = 0; i < product.images.length; i++) {
          const imageUrl = product.images[i];
          totalImages++;
          
          console.log(`  Imagem ${i + 1}: ${imageUrl || 'VAZIA'}`);
          
          // Verificar se URL está vazia
          if (!imageUrl || imageUrl.trim() === '') {
            emptyUrls++;
            problematicUrls.push({
              productId: product.id,
              productName: product.name,
              imageIndex: i,
              url: imageUrl,
              issue: 'URL vazia'
            });
            console.log(`    ❌ URL vazia`);
            continue;
          }
          
          // Verificar se URL começa com http/https
          if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            invalidUrls++;
            problematicUrls.push({
              productId: product.id,
              productName: product.name,
              imageIndex: i,
              url: imageUrl,
              issue: 'URL não começa com http/https'
            });
            console.log(`    ❌ URL inválida (não começa com http/https)`);
            continue;
          }
          
          // Testar se a URL responde corretamente
          try {
            const imageResponse = await fetch(imageUrl, {
              method: 'HEAD',
              timeout: 5000
            });
            
            if (imageResponse.ok) {
              validUrls++;
              validUrlExamples.push(imageUrl);
              console.log(`    ✅ URL válida (${imageResponse.status})`);
            } else {
              brokenUrls++;
              problematicUrls.push({
                productId: product.id,
                productName: product.name,
                imageIndex: i,
                url: imageUrl,
                issue: `HTTP ${imageResponse.status} - ${imageResponse.statusText}`
              });
              console.log(`    ❌ URL quebrada (${imageResponse.status})`);
            }
          } catch (error) {
            brokenUrls++;
            problematicUrls.push({
              productId: product.id,
              productName: product.name,
              imageIndex: i,
              url: imageUrl,
              issue: `Erro de rede: ${error.message}`
            });
            console.log(`    ❌ Erro ao acessar URL: ${error.message}`);
          }
        }
      } else {
        console.log(`📸 Nenhuma imagem encontrada`);
      }
    }

    // 3. Relatório final
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RELATÓRIO FINAL');
    console.log('=' .repeat(60));
    console.log(`Total de imagens analisadas: ${totalImages}`);
    console.log(`✅ URLs válidas: ${validUrls} (${((validUrls/totalImages)*100).toFixed(1)}%)`);
    console.log(`❌ URLs vazias: ${emptyUrls} (${((emptyUrls/totalImages)*100).toFixed(1)}%)`);
    console.log(`❌ URLs inválidas: ${invalidUrls} (${((invalidUrls/totalImages)*100).toFixed(1)}%)`);
    console.log(`❌ URLs quebradas: ${brokenUrls} (${((brokenUrls/totalImages)*100).toFixed(1)}%)`);

    // 4. Exemplos de URLs problemáticas
    if (problematicUrls.length > 0) {
      console.log('\n🚨 EXEMPLOS DE URLs PROBLEMÁTICAS:');
      console.log('-' .repeat(40));
      
      problematicUrls.slice(0, 10).forEach((item, index) => {
        console.log(`${index + 1}. Produto: ${item.productName}`);
        console.log(`   URL: ${item.url}`);
        console.log(`   Problema: ${item.issue}`);
        console.log('');
      });
      
      if (problematicUrls.length > 10) {
        console.log(`... e mais ${problematicUrls.length - 10} URLs problemáticas`);
      }
    }

    // 5. Exemplos de URLs válidas
    if (validUrlExamples.length > 0) {
      console.log('\n✅ EXEMPLOS DE URLs VÁLIDAS:');
      console.log('-' .repeat(40));
      validUrlExamples.slice(0, 5).forEach((url, index) => {
        console.log(`${index + 1}. ${url}`);
      });
    }

    // 6. Salvar relatório em arquivo
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalImages,
        validUrls,
        emptyUrls,
        invalidUrls,
        brokenUrls
      },
      problematicUrls,
      validUrlExamples: validUrlExamples.slice(0, 10)
    };

    fs.writeFileSync('image_test_report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Relatório salvo em: image_test_report.json');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Executar o teste
testImageUrls();
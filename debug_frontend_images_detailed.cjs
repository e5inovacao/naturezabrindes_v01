const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

// Função para testar uma URL de imagem
async function testImageUrl(url, productName = 'Unknown') {
  try {
    console.log(`\n🔍 Testando imagem: ${productName}`);
    console.log(`📎 URL: ${url}`);
    
    if (!url || url === null || url === undefined) {
      return {
        url: url,
        productName,
        status: 'NO_URL',
        error: 'URL é null/undefined'
      };
    }
    
    // Verificar se é uma URL válida
    try {
      new URL(url);
    } catch (e) {
      return {
        url,
        productName,
        status: 'INVALID_URL',
        error: 'URL malformada'
      };
    }
    
    // Testar a URL
    const response = await makeRequest(url);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ Imagem OK (${response.status})`);
      return {
        url,
        productName,
        status: 'OK',
        httpStatus: response.status
      };
    } else {
      console.log(`❌ Imagem com problema (${response.status})`);
      return {
        url,
        productName,
        status: 'HTTP_ERROR',
        error: `HTTP ${response.status}`,
        httpStatus: response.status
      };
    }
  } catch (error) {
    console.log(`❌ Erro ao testar: ${error.message}`);
    return {
      url,
      productName,
      status: 'NETWORK_ERROR',
      error: error.message
    };
  }
}

// Função principal
async function debugFrontendImages() {
  console.log('🚀 Debug detalhado das imagens do frontend...');
  console.log('=' .repeat(60));
  
  try {
    // 1. Buscar produtos da API
    console.log('\n📡 Buscando produtos da API...');
    const apiResponse = await makeRequest('http://localhost:5175/api/products?limit=10');
    const apiData = await apiResponse.json();
    
    console.log(`\n📊 Resposta da API:`);
    console.log(`- Status: ${apiResponse.status}`);
    console.log(`- Estrutura dos dados:`, Object.keys(apiData));
    
    if (!apiData.success || !apiData.data || !apiData.data.items) {
      console.error('❌ Estrutura de dados inválida da API');
      return;
    }
    
    const products = apiData.data.items;
    console.log(`- Total de produtos: ${products.length}`);
    
    if (products.length === 0) {
      console.log('⚠️ Nenhum produto encontrado na API');
      return;
    }
    
    // 2. Analisar estrutura dos produtos
    console.log('\n🔍 Analisando estrutura dos produtos...');
    const firstProduct = products[0];
    console.log('\n📋 Estrutura do primeiro produto:');
    console.log('- ID:', firstProduct.id);
    console.log('- Nome:', firstProduct.name);
    console.log('- Categoria:', firstProduct.category);
    console.log('- Campos de imagem disponíveis:');
    
    // Verificar todos os campos relacionados a imagens
    const imageFields = ['images', 'image', 'colorVariations', 'allImages'];
    imageFields.forEach(field => {
      if (firstProduct[field] !== undefined) {
        console.log(`  - ${field}:`, firstProduct[field]);
      } else {
        console.log(`  - ${field}: (não existe)`);
      }
    });
    
    // 3. Testar como o frontend acessa as imagens
    console.log('\n🎯 Testando acesso às imagens como o frontend faz...');
    
    const testResults = [];
    
    for (let i = 0; i < Math.min(5, products.length); i++) {
      const product = products[i];
      console.log(`\n--- Produto ${i + 1}: ${product.name} ---`);
      
      // Simular exatamente como o frontend acessa: product.images?.[0]
      const frontendImageUrl = product.images?.[0];
      console.log('Frontend tentaria acessar:', frontendImageUrl);
      
      if (!frontendImageUrl) {
        console.log('❌ Frontend não encontraria imagem (product.images?.[0] é undefined/null)');
        testResults.push({
          productName: product.name,
          frontendAccess: 'FAILED',
          reason: 'product.images?.[0] é undefined/null',
          availableImages: {
            images: product.images,
            colorVariations: product.colorVariations,
            allImages: product.allImages
          }
        });
        continue;
      }
      
      // Testar a URL que o frontend encontraria
      const result = await testImageUrl(frontendImageUrl, product.name);
      testResults.push({
        productName: product.name,
        frontendAccess: 'SUCCESS',
        imageUrl: frontendImageUrl,
        testResult: result
      });
    }
    
    // 4. Gerar relatório
    console.log('\n📊 RELATÓRIO FINAL');
    console.log('=' .repeat(50));
    
    const report = {
      timestamp: new Date().toISOString(),
      apiStatus: apiResponse.status,
      totalProducts: products.length,
      testedProducts: testResults.length,
      summary: {
        frontendAccessSuccess: testResults.filter(r => r.frontendAccess === 'SUCCESS').length,
        frontendAccessFailed: testResults.filter(r => r.frontendAccess === 'FAILED').length,
        imageUrlsWorking: testResults.filter(r => r.testResult?.status === 'OK').length,
        imageUrlsBroken: testResults.filter(r => r.testResult?.status !== 'OK').length
      },
      details: testResults
    };
    
    console.log('\n📈 Resumo:');
    console.log(`- Produtos testados: ${report.testedProducts}`);
    console.log(`- Frontend consegue acessar imagem: ${report.summary.frontendAccessSuccess}`);
    console.log(`- Frontend NÃO consegue acessar imagem: ${report.summary.frontendAccessFailed}`);
    console.log(`- URLs de imagem funcionando: ${report.summary.imageUrlsWorking}`);
    console.log(`- URLs de imagem quebradas: ${report.summary.imageUrlsBroken}`);
    
    // Mostrar problemas específicos
    const failedAccess = testResults.filter(r => r.frontendAccess === 'FAILED');
    if (failedAccess.length > 0) {
      console.log('\n❌ PROBLEMAS ENCONTRADOS:');
      failedAccess.forEach(item => {
        console.log(`\n- Produto: ${item.productName}`);
        console.log(`  Problema: ${item.reason}`);
        console.log(`  Imagens disponíveis:`);
        console.log(`    - images: ${JSON.stringify(item.availableImages.images)}`);
        console.log(`    - colorVariations: ${JSON.stringify(item.availableImages.colorVariations)}`);
        console.log(`    - allImages: ${JSON.stringify(item.availableImages.allImages)}`);
      });
    }
    
    // Salvar relatório
    fs.writeFileSync('frontend_debug_report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Relatório salvo em: frontend_debug_report.json');
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  }
}

// Executar o debug
debugFrontendImages();
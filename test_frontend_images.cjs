const https = require('https');
const http = require('http');
const fs = require('fs');
const { URL } = require('url');

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      timeout: options.timeout || 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data)
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

// Função para testar uma URL de imagem específica
async function testImageUrl(url, productName = 'Unknown') {
  try {
    console.log(`\n🔍 Testando: ${productName}`);
    console.log(`📎 URL: ${url}`);
    
    // Verificar se é uma URL válida
    try {
      new URL(url);
    } catch (e) {
      return {
        url,
        productName,
        status: 'INVALID_URL',
        error: 'URL malformada',
        details: e.message
      };
    }
    
    // Fazer requisição HTTP
    const response = await makeRequest(url, {
      method: 'HEAD', // Usar HEAD para economizar banda
      timeout: 10000
    });
    
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length') || 'unknown';
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Content-Type: ${contentType}`);
    console.log(`📏 Content-Length: ${contentLength}`);
    
    return {
      url,
      productName,
      status: response.status,
      contentType,
      contentLength,
      isImage: contentType.startsWith('image/'),
      success: response.ok && contentType.startsWith('image/')
    };
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return {
      url,
      productName,
      status: 'ERROR',
      error: error.message,
      success: false
    };
  }
}

// Função principal
async function testFrontendImages() {
  console.log('🚀 Iniciando teste de imagens do frontend...');
  
  try {
    // 1. Buscar produtos da API
    console.log('\n📡 Buscando produtos da API...');
    const apiResponse = await makeRequest('http://localhost:5175/api/products?limit=50');
    const apiData = await apiResponse.json();
    
    if (!apiData.success || !apiData.data?.items) {
      throw new Error('Erro ao buscar produtos da API');
    }
    
    const products = apiData.data.items;
    console.log(`✅ ${products.length} produtos encontrados`);
    
    // 2. Testar URLs das imagens
    const results = [];
    
    for (let i = 0; i < Math.min(products.length, 20); i++) {
      const product = products[i];
      
      if (product.image_url) {
        const result = await testImageUrl(product.image_url, product.name);
        results.push(result);
        
        // Pequena pausa entre requisições
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log(`\n⚠️  Produto sem imagem: ${product.name}`);
        results.push({
          url: null,
          productName: product.name,
          status: 'NO_IMAGE',
          error: 'Produto não possui URL de imagem'
        });
      }
    }
    
    // 3. Analisar resultados
    console.log('\n📊 RESUMO DOS RESULTADOS:');
    console.log('=' .repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const noImage = results.filter(r => r.status === 'NO_IMAGE');
    
    console.log(`✅ Imagens válidas: ${successful.length}`);
    console.log(`❌ Imagens com problema: ${failed.length}`);
    console.log(`⚠️  Produtos sem imagem: ${noImage.length}`);
    
    // 4. Mostrar detalhes dos problemas
    if (failed.length > 0) {
      console.log('\n🔍 DETALHES DOS PROBLEMAS:');
      failed.forEach(result => {
        console.log(`\n❌ ${result.productName}:`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Erro: ${result.error || result.status}`);
      });
    }
    
    // 5. Verificar domínios
    console.log('\n🌐 ANÁLISE DE DOMÍNIOS:');
    const domains = {};
    results.forEach(result => {
      if (result.url) {
        try {
          const domain = new URL(result.url).hostname;
          domains[domain] = (domains[domain] || 0) + 1;
        } catch (e) {
          domains['INVALID'] = (domains['INVALID'] || 0) + 1;
        }
      }
    });
    
    Object.entries(domains).forEach(([domain, count]) => {
      console.log(`   ${domain}: ${count} imagem(ns)`);
    });
    
    // 6. Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        noImage: noImage.length
      },
      domains,
      results
    };
    
    fs.writeFileSync('frontend_image_test_report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Relatório salvo em: frontend_image_test_report.json');
    
    // 7. Conclusões
    console.log('\n🎯 CONCLUSÕES:');
    if (failed.length === 0) {
      console.log('✅ Todas as URLs de imagem estão funcionando corretamente!');
      console.log('🤔 O problema pode estar no frontend (CORS, CSP, etc.)');
    } else {
      console.log(`❌ ${failed.length} URL(s) com problema encontrada(s)`);
      console.log('🔧 Verifique os detalhes acima para resolver os problemas');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar o teste
testFrontendImages().catch(console.error);
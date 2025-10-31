const https = require('https');
const http = require('http');
const { URL } = require('url');

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url, isApiCall = false) {
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
          contentType: res.headers['content-type'],
          contentLength: res.headers['content-length'],
          data: isApiCall ? data : data.slice(0, 100) // Para API, captura tudo; para imagens, só 100 bytes
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

// Função para testar CORS
function testCORS(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5175',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };
    
    const req = client.request(options, (res) => {
      resolve({
        status: res.statusCode,
        corsHeaders: {
          'access-control-allow-origin': res.headers['access-control-allow-origin'],
          'access-control-allow-methods': res.headers['access-control-allow-methods'],
          'access-control-allow-headers': res.headers['access-control-allow-headers']
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('CORS Timeout'));
    });
    req.end();
  });
}

// Função principal
async function debugReactImages() {
  console.log('🔍 Debug específico para imagens React...');
  console.log('=' .repeat(60));
  
  try {
    // 1. Buscar produtos da API
    console.log('\n📡 Buscando produtos da API...');
    const apiResponse = await makeRequest('http://localhost:5175/api/products?limit=5', true);
    
    if (apiResponse.status !== 200) {
      console.error(`❌ API retornou status ${apiResponse.status}`);
      console.log('Resposta completa:', apiResponse.data);
      return;
    }
    
    console.log('📄 Primeiros 200 caracteres da resposta:', apiResponse.data.slice(0, 200));
    
    let apiData;
    try {
      apiData = JSON.parse(apiResponse.data);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError.message);
      console.log('📄 Resposta completa da API:', apiResponse.data);
      return;
    }
    
    if (!apiData.success || !apiData.data?.items) {
      console.error('❌ Estrutura de dados inválida da API');
      return;
    }
    
    const products = apiData.data.items;
    console.log(`✅ ${products.length} produtos encontrados`);
    
    // 2. Testar cada imagem detalhadamente
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const imageUrl = product.images?.[0];
      
      console.log(`\n--- Produto ${i + 1}: ${product.name} ---`);
      console.log(`📎 URL da imagem: ${imageUrl}`);
      
      if (!imageUrl) {
        console.log('⚠️ Produto sem URL de imagem');
        continue;
      }
      
      try {
        // Testar requisição direta
        console.log('\n🔍 Testando requisição direta...');
        const imageResponse = await makeRequest(imageUrl);
        
        console.log(`Status: ${imageResponse.status}`);
        console.log(`Content-Type: ${imageResponse.contentType}`);
        console.log(`Content-Length: ${imageResponse.contentLength}`);
        
        // Verificar se é realmente uma imagem
        const isImage = imageResponse.contentType && imageResponse.contentType.startsWith('image/');
        console.log(`É imagem válida: ${isImage ? '✅' : '❌'}`);
        
        if (imageResponse.status === 200 && isImage) {
          console.log('✅ Imagem carrega corretamente via HTTP');
        } else {
          console.log(`❌ Problema na imagem: Status ${imageResponse.status}, Type: ${imageResponse.contentType}`);
        }
        
        // Testar CORS
        console.log('\n🌐 Testando CORS...');
        try {
          const corsResponse = await testCORS(imageUrl);
          console.log(`CORS Status: ${corsResponse.status}`);
          console.log('CORS Headers:', corsResponse.corsHeaders);
          
          const allowsOrigin = corsResponse.corsHeaders['access-control-allow-origin'];
          if (allowsOrigin === '*' || allowsOrigin === 'http://localhost:5175') {
            console.log('✅ CORS permite acesso');
          } else {
            console.log(`⚠️ CORS pode estar bloqueando: ${allowsOrigin}`);
          }
        } catch (corsError) {
          console.log(`⚠️ Erro ao testar CORS: ${corsError.message}`);
        }
        
        // Simular como o React carregaria
        console.log('\n⚛️ Simulando carregamento React...');
        
        // Verificar se a função getValidImageUrl bloquearia esta URL
        const url = new URL(imageUrl);
        const problematicDomains = [
          'cdn.xbzbrindes.com.br', 
          'www.cdn.xbzbrindes.com.br',
          'images.unsplash.com',
          'via.placeholder.com'
        ];
        
        const wouldBeBlocked = problematicDomains.includes(url.hostname);
        console.log(`Hostname: ${url.hostname}`);
        console.log(`Seria bloqueada por getValidImageUrl: ${wouldBeBlocked ? '❌' : '✅'}`);
        
        if (wouldBeBlocked) {
          console.log('🚨 PROBLEMA ENCONTRADO: getValidImageUrl está bloqueando esta URL!');
        }
        
      } catch (error) {
        console.log(`❌ Erro ao testar imagem: ${error.message}`);
      }
    }
    
    // 3. Testar algumas URLs específicas conhecidas
    console.log('\n\n🧪 TESTE ESPECÍFICO DE URLs CONHECIDAS');
    console.log('=' .repeat(50));
    
    const testUrls = [
      'https://www.spotgifts.com.br/fotos/produtos/53421_set.jpg',
      'https://www.spotgifts.com.br/fotos/produtos/53791_set.jpg',
      'https://www.spotgifts.com.br/fotos/produtos/53426_set.jpg'
    ];
    
    for (const testUrl of testUrls) {
      console.log(`\n🔍 Testando: ${testUrl}`);
      
      try {
        const response = await makeRequest(testUrl);
        console.log(`✅ Status: ${response.status}, Type: ${response.contentType}`);
        
        // Verificar se getValidImageUrl bloquearia
        const url = new URL(testUrl);
        const problematicDomains = [
          'cdn.xbzbrindes.com.br', 
          'www.cdn.xbzbrindes.com.br',
          'images.unsplash.com',
          'via.placeholder.com'
        ];
        
        const wouldBeBlocked = problematicDomains.includes(url.hostname);
        console.log(`Hostname: ${url.hostname}`);
        console.log(`getValidImageUrl bloquearia: ${wouldBeBlocked ? '❌ SIM' : '✅ NÃO'}`);
        
      } catch (error) {
        console.log(`❌ Erro: ${error.message}`);
      }
    }
    
    // 4. Resumo e diagnóstico
    console.log('\n\n📋 DIAGNÓSTICO FINAL');
    console.log('=' .repeat(40));
    
    console.log('\n🔍 Possíveis causas das imagens quebradas:');
    console.log('1. ❌ URLs inválidas ou não acessíveis');
    console.log('2. 🌐 Problemas de CORS');
    console.log('3. ⚛️ Função getValidImageUrl bloqueando URLs válidas');
    console.log('4. 🖼️ Content-Type incorreto');
    console.log('5. 🔒 Problemas de SSL/HTTPS');
    console.log('6. 🚫 Bloqueio por CSP (Content Security Policy)');
    
    console.log('\n💡 Próximos passos recomendados:');
    console.log('1. Verificar logs do console do navegador');
    console.log('2. Inspecionar Network tab no DevTools');
    console.log('3. Testar URLs diretamente no navegador');
    console.log('4. Verificar se há CSP bloqueando imagens externas');
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  }
}

// Executar o debug
debugReactImages();
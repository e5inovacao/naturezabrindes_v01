// Script para debugar imagens quebradas no frontend
// Execute este script no console do navegador na página do catálogo

console.log('🔍 Iniciando debug das imagens no frontend...');

// Função para testar carregamento de imagem
function testImageLoad(url) {
  return new Promise((resolve) => {
    const img = new Image();
    const startTime = Date.now();
    
    img.onload = () => {
      const loadTime = Date.now() - startTime;
      resolve({
        url,
        status: 'success',
        loadTime,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
    };
    
    img.onerror = (error) => {
      const loadTime = Date.now() - startTime;
      resolve({
        url,
        status: 'error',
        loadTime,
        error: error.message || 'Failed to load'
      });
    };
    
    img.src = url;
  });
}

// Função para analisar todas as imagens na página
async function analyzePageImages() {
  console.log('📊 Analisando imagens na página atual...');
  
  const images = document.querySelectorAll('img');
  console.log(`Encontradas ${images.length} tags <img> na página`);
  
  const results = [];
  
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = img.src;
    
    console.log(`\n🖼️ Imagem ${i + 1}:`);
    console.log(`URL: ${src}`);
    console.log(`Complete: ${img.complete}`);
    console.log(`Natural Width: ${img.naturalWidth}`);
    console.log(`Natural Height: ${img.naturalHeight}`);
    console.log(`Display Width: ${img.width}`);
    console.log(`Display Height: ${img.height}`);
    console.log(`Alt: ${img.alt}`);
    console.log(`Classes: ${img.className}`);
    
    // Verificar se a imagem carregou corretamente
    if (img.complete && img.naturalWidth === 0) {
      console.log('❌ Imagem quebrada detectada!');
      results.push({
        index: i + 1,
        url: src,
        status: 'broken',
        element: img
      });
    } else if (img.complete && img.naturalWidth > 0) {
      console.log('✅ Imagem carregada com sucesso');
      results.push({
        index: i + 1,
        url: src,
        status: 'loaded',
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    } else {
      console.log('⏳ Imagem ainda carregando...');
      // Testar carregamento
      const testResult = await testImageLoad(src);
      console.log(`Resultado do teste: ${testResult.status}`);
      results.push({
        index: i + 1,
        url: src,
        status: testResult.status,
        ...testResult
      });
    }
  }
  
  return results;
}

// Função para verificar políticas de segurança
function checkSecurityPolicies() {
  console.log('\n🔒 Verificando políticas de segurança...');
  
  // Verificar CSP
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (cspMeta) {
    console.log('CSP encontrado:', cspMeta.content);
  } else {
    console.log('Nenhuma CSP meta tag encontrada');
  }
  
  // Verificar headers de resposta (se possível)
  console.log('Headers de resposta (verificar no Network tab):');
  console.log('- Content-Security-Policy');
  console.log('- X-Content-Type-Options');
  console.log('- Referrer-Policy');
}

// Função para testar URLs específicas
async function testSpecificUrls() {
  console.log('\n🧪 Testando URLs específicas das imagens...');
  
  const testUrls = [
    'https://www.spotgifts.com.br/fotos/produtos/53421_set.jpg',
    'https://www.spotgifts.com.br/fotos/produtos/53421_103.jpg',
    'https://www.spotgifts.com.br/fotos/produtos/53791_set.jpg'
  ];
  
  for (const url of testUrls) {
    console.log(`\nTestando: ${url}`);
    const result = await testImageLoad(url);
    console.log(`Status: ${result.status}`);
    if (result.status === 'success') {
      console.log(`Dimensões: ${result.naturalWidth}x${result.naturalHeight}`);
      console.log(`Tempo de carregamento: ${result.loadTime}ms`);
    } else {
      console.log(`Erro: ${result.error}`);
    }
  }
}

// Função principal
async function debugImages() {
  console.log('🚀 Iniciando debug completo das imagens...');
  
  checkSecurityPolicies();
  
  const results = await analyzePageImages();
  
  await testSpecificUrls();
  
  // Resumo
  console.log('\n📋 RESUMO:');
  const broken = results.filter(r => r.status === 'broken' || r.status === 'error');
  const loaded = results.filter(r => r.status === 'loaded' || r.status === 'success');
  
  console.log(`Total de imagens: ${results.length}`);
  console.log(`Imagens carregadas: ${loaded.length}`);
  console.log(`Imagens quebradas: ${broken.length}`);
  
  if (broken.length > 0) {
    console.log('\n❌ Imagens problemáticas:');
    broken.forEach(img => {
      console.log(`- Imagem ${img.index}: ${img.url}`);
      if (img.error) console.log(`  Erro: ${img.error}`);
    });
  }
  
  return results;
}

// Executar automaticamente se estiver no contexto do navegador
if (typeof window !== 'undefined') {
  debugImages();
} else {
  console.log('Execute este script no console do navegador na página do catálogo');
}

// Exportar funções para uso manual
if (typeof window !== 'undefined') {
  window.debugImages = debugImages;
  window.analyzePageImages = analyzePageImages;
  window.testImageLoad = testImageLoad;
}
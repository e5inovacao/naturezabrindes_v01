import fetch from 'node-fetch';
import fs from 'fs';

async function testProductsWithImages() {
  console.log('🔍 Testando produtos que possuem imagens...');
  
  const report = {
    timestamp: new Date().toISOString(),
    totalProducts: 0,
    productsWithImages: 0,
    validImages: 0,
    invalidImages: 0,
    brokenImages: 0,
    issues: [],
    workingImages: []
  };

  try {
    // Testar diferentes endpoints para encontrar produtos com imagens
    const endpoints = [
      'http://localhost:3005/api/products?limit=100',
      'http://localhost:3005/api/products?category=canetas&limit=50',
      'http://localhost:3005/api/products?search=caneta&limit=50'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n📡 Testando endpoint: ${endpoint}`);
      
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          console.log(`❌ Endpoint retornou status ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        const products = data.data?.items || data.products || data.items || data;
        
        if (!Array.isArray(products)) {
          console.log('❌ Endpoint não retornou array de produtos');
          continue;
        }
        
        console.log(`✅ Encontrados ${products.length} produtos`);
        report.totalProducts += products.length;
        
        // Verificar produtos com imagens
        for (const product of products) {
          if (product.imagem || product.image || product.imageUrl) {
            report.productsWithImages++;
            const imageUrl = product.imagem || product.image || product.imageUrl;
            
            console.log(`\n🖼️  Produto com imagem: ${product.nome || product.name}`);
            console.log(`   URL: ${imageUrl}`);
            
            await testSingleImage(imageUrl, product, 'principal', report);
          }
        }
        
      } catch (error) {
        console.log(`❌ Erro ao testar endpoint: ${error.message}`);
      }
    }
    
    // Gerar relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('='.repeat(60));
    console.log(`Total de produtos testados: ${report.totalProducts}`);
    console.log(`Produtos com imagens: ${report.productsWithImages}`);
    console.log(`Imagens funcionando: ${report.validImages}`);
    console.log(`Imagens inválidas: ${report.invalidImages}`);
    console.log(`Imagens quebradas: ${report.brokenImages}`);
    console.log(`Total de problemas: ${report.issues.length}`);
    
    if (report.workingImages.length > 0) {
      console.log('\n✅ IMAGENS FUNCIONANDO:');
      report.workingImages.forEach((img, index) => {
        console.log(`${index + 1}. ${img.productName}`);
        console.log(`   URL: ${img.imageUrl}`);
        console.log(`   Status: ${img.status}`);
        console.log('');
      });
    }
    
    if (report.issues.length > 0) {
      console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
      report.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.issue}`);
        console.log(`   Produto: ${issue.productName}`);
        console.log(`   URL: ${issue.imageUrl}`);
        if (issue.error) {
          console.log(`   Erro: ${issue.error}`);
        }
        console.log('');
      });
    }
    
    // Salvar relatório
    const reportFile = 'products_with_images_report.json';
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`💾 Relatório salvo em: ${reportFile}`);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

async function testSingleImage(imageUrl, product, type, report) {
  try {
    // Verificar se a URL é válida
    if (!imageUrl || typeof imageUrl !== 'string') {
      report.invalidImages++;
      report.issues.push({
        productId: product.id,
        productName: product.nome || product.name,
        issue: `URL de imagem ${type} inválida ou vazia`,
        imageUrl: imageUrl
      });
      return;
    }
    
    // Verificar se começa com http/https
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      report.invalidImages++;
      report.issues.push({
        productId: product.id,
        productName: product.nome || product.name,
        issue: `URL de imagem ${type} não começa com http/https`,
        imageUrl: imageUrl
      });
      return;
    }
    
    console.log(`  🔍 Testando: ${imageUrl.substring(0, 80)}...`);
    
    // Testar se a URL responde
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    try {
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
          report.validImages++;
          report.workingImages.push({
            productId: product.id,
            productName: product.nome || product.name,
            imageUrl: imageUrl,
            status: `${response.status} - ${contentType}`
          });
          console.log(`    ✅ OK (${response.status}) - ${contentType}`);
        } else {
          report.brokenImages++;
          report.issues.push({
            productId: product.id,
            productName: product.nome || product.name,
            issue: `Imagem ${type} não retorna content-type de imagem`,
            imageUrl: imageUrl,
            error: `Content-Type: ${contentType}`
          });
          console.log(`    ⚠️  Não é imagem (${response.status}) - ${contentType}`);
        }
      } else {
        report.brokenImages++;
        report.issues.push({
          productId: product.id,
          productName: product.nome || product.name,
          issue: `Imagem ${type} retornou erro HTTP`,
          imageUrl: imageUrl,
          error: `Status ${response.status}: ${response.statusText}`
        });
        console.log(`    ❌ Erro ${response.status}: ${response.statusText}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      report.brokenImages++;
      report.issues.push({
        productId: product.id,
        productName: product.nome || product.name,
        issue: `Erro ao acessar imagem ${type}`,
        imageUrl: imageUrl,
        error: fetchError.message
      });
      console.log(`    ❌ Erro de rede: ${fetchError.message}`);
    }
    
  } catch (error) {
    report.brokenImages++;
    report.issues.push({
      productId: product.id,
      productName: product.nome || product.name,
      issue: `Erro inesperado ao testar imagem ${type}`,
      imageUrl: imageUrl,
      error: error.message
    });
    console.log(`    ❌ Erro inesperado: ${error.message}`);
  }
}

// Executar o teste
testProductsWithImages().catch(console.error);
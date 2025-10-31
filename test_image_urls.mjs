import fetch from 'node-fetch';
import fs from 'fs';

async function testImageUrls() {
  console.log('🔍 Iniciando teste das URLs das imagens do catálogo...');
  
  const report = {
    timestamp: new Date().toISOString(),
    totalProducts: 0,
    validImages: 0,
    invalidImages: 0,
    brokenImages: 0,
    issues: []
  };

  try {
    // 1. Consultar a API de produtos
    console.log('📡 Consultando API de produtos...');
    const response = await fetch('http://localhost:3005/api/products?limit=50');
    
    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }
    
    const data = await response.json();
    const products = data.data?.items || data.products || data.items || data;
    
    if (!Array.isArray(products)) {
      throw new Error('API não retornou um array de produtos');
    }
    
    console.log(`✅ Encontrados ${products.length} produtos`);
    report.totalProducts = products.length;
    
    // 2. Verificar cada produto e suas imagens
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n🔍 Testando produto ${i + 1}/${products.length}: ${product.nome || product.name || 'Sem nome'}`);
      
      // Verificar imagem principal
      if (product.imagem || product.image) {
        const imageUrl = product.imagem || product.image;
        await testSingleImage(imageUrl, product, 'principal', report);
      } else {
        report.issues.push({
          productId: product.id,
          productName: product.nome || product.name,
          issue: 'Produto sem imagem principal',
          imageUrl: null
        });
      }
      
      // Verificar imagens adicionais se existirem
      if (product.imagens && Array.isArray(product.imagens)) {
        for (let j = 0; j < product.imagens.length; j++) {
          await testSingleImage(product.imagens[j], product, `adicional_${j}`, report);
        }
      }
    }
    
    // 3. Gerar relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('='.repeat(50));
    console.log(`Total de produtos: ${report.totalProducts}`);
    console.log(`Imagens válidas: ${report.validImages}`);
    console.log(`Imagens inválidas: ${report.invalidImages}`);
    console.log(`Imagens quebradas: ${report.brokenImages}`);
    console.log(`Total de problemas: ${report.issues.length}`);
    
    if (report.issues.length > 0) {
      console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
      report.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.issue}`);
        console.log(`   Produto: ${issue.productName} (ID: ${issue.productId})`);
        if (issue.imageUrl) {
          console.log(`   URL: ${issue.imageUrl}`);
        }
        if (issue.error) {
          console.log(`   Erro: ${issue.error}`);
        }
        console.log('');
      });
    }
    
    // Salvar relatório em arquivo
    const reportFile = 'image_test_report.json';
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`💾 Relatório salvo em: ${reportFile}`);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    report.issues.push({
      productId: null,
      productName: null,
      issue: 'Erro geral do teste',
      error: error.message
    });
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
    
    console.log(`  🖼️  Testando imagem ${type}: ${imageUrl.substring(0, 80)}...`);
    
    // Testar se a URL responde
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
          report.validImages++;
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
testImageUrls().catch(console.error);
import fetch from 'node-fetch';
import fs from 'fs';

async function finalImageTest() {
  console.log('🔍 TESTE FINAL DAS IMAGENS DO CATÁLOGO');
  console.log('='.repeat(60));
  
  const report = {
    timestamp: new Date().toISOString(),
    totalProducts: 0,
    productsWithImages: 0,
    totalImageUrls: 0,
    validImages: 0,
    invalidImages: 0,
    brokenImages: 0,
    issues: [],
    workingImages: [],
    imagesByType: {
      mainImages: { total: 0, working: 0, broken: 0 },
      allImages: { total: 0, working: 0, broken: 0 },
      colorVariations: { total: 0, working: 0, broken: 0 }
    }
  };

  try {
    console.log('📡 Consultando API de produtos...');
    const response = await fetch('http://localhost:3005/api/products?limit=50');
    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }
    
    const data = await response.json();
    const products = data.data?.items || data.products || data.items || data;
    
    if (!Array.isArray(products)) {
      throw new Error('API não retornou array de produtos');
    }
    
    console.log(`✅ Encontrados ${products.length} produtos\n`);
    report.totalProducts = products.length;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n🔍 Produto ${i + 1}/${products.length}: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      
      let hasImages = false;
      
      // Testar array 'images'
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        hasImages = true;
        console.log(`   📸 ${product.images.length} imagem(ns) principal(is)`);
        report.imagesByType.mainImages.total += product.images.length;
        
        for (const imageUrl of product.images) {
          report.totalImageUrls++;
          await testSingleImage(imageUrl, product, 'principal', report, 'mainImages');
        }
      }
      
      // Testar array 'allImages'
      if (product.allImages && Array.isArray(product.allImages) && product.allImages.length > 0) {
        hasImages = true;
        console.log(`   🖼️  ${product.allImages.length} imagem(ns) no allImages`);
        report.imagesByType.allImages.total += product.allImages.length;
        
        for (const imageUrl of product.allImages) {
          report.totalImageUrls++;
          await testSingleImage(imageUrl, product, 'allImages', report, 'allImages');
        }
      }
      
      // Testar imagens em colorVariations
      if (product.colorVariations && Array.isArray(product.colorVariations) && product.colorVariations.length > 0) {
        const colorImagesCount = product.colorVariations.filter(cv => cv.image).length;
        if (colorImagesCount > 0) {
          hasImages = true;
          console.log(`   🎨 ${colorImagesCount} imagem(ns) de variações de cor`);
          report.imagesByType.colorVariations.total += colorImagesCount;
          
          for (const colorVar of product.colorVariations) {
            if (colorVar.image) {
              report.totalImageUrls++;
              await testSingleImage(colorVar.image, product, `cor ${colorVar.color}`, report, 'colorVariations');
            }
          }
        }
      }
      
      if (hasImages) {
        report.productsWithImages++;
      } else {
        console.log('   ❌ Produto sem imagens');
      }
    }
    
    // Gerar relatório final
    console.log('\n\n📊 RELATÓRIO FINAL DO TESTE DE IMAGENS');
    console.log('='.repeat(60));
    console.log(`📦 Total de produtos testados: ${report.totalProducts}`);
    console.log(`🖼️  Produtos com imagens: ${report.productsWithImages}`);
    console.log(`🔗 Total de URLs de imagem testadas: ${report.totalImageUrls}`);
    console.log(`✅ Imagens funcionando: ${report.validImages}`);
    console.log(`❌ Imagens quebradas: ${report.brokenImages}`);
    console.log(`⚠️  URLs inválidas: ${report.invalidImages}`);
    console.log(`🚨 Total de problemas: ${report.issues.length}`);
    
    console.log('\n📈 ESTATÍSTICAS POR TIPO:');
    console.log(`   Imagens principais: ${report.imagesByType.mainImages.working}/${report.imagesByType.mainImages.total} funcionando`);
    console.log(`   AllImages: ${report.imagesByType.allImages.working}/${report.imagesByType.allImages.total} funcionando`);
    console.log(`   Variações de cor: ${report.imagesByType.colorVariations.working}/${report.imagesByType.colorVariations.total} funcionando`);
    
    // Taxa de sucesso
    const successRate = report.totalImageUrls > 0 ? ((report.validImages / report.totalImageUrls) * 100).toFixed(1) : 0;
    console.log(`\n📊 Taxa de sucesso: ${successRate}%`);
    
    if (report.workingImages.length > 0) {
      console.log('\n✅ EXEMPLOS DE IMAGENS FUNCIONANDO:');
      report.workingImages.slice(0, 5).forEach((img, index) => {
        console.log(`${index + 1}. ${img.productName} (${img.type})`);
        console.log(`   URL: ${img.imageUrl}`);
        console.log(`   Status: ${img.status}`);
      });
      if (report.workingImages.length > 5) {
        console.log(`   ... e mais ${report.workingImages.length - 5} imagens funcionando`);
      }
    }
    
    if (report.issues.length > 0) {
      console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
      const issueTypes = {};
      report.issues.forEach(issue => {
        issueTypes[issue.issue] = (issueTypes[issue.issue] || 0) + 1;
      });
      
      Object.entries(issueTypes).forEach(([issue, count]) => {
        console.log(`   ${issue}: ${count} ocorrência(s)`);
      });
      
      console.log('\n🔍 PRIMEIROS 5 PROBLEMAS DETALHADOS:');
      report.issues.slice(0, 5).forEach((issue, index) => {
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
    const reportFile = 'final_image_test_report.json';
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`💾 Relatório completo salvo em: ${reportFile}`);
    
    // Resumo para correção
    console.log('\n🔧 RECOMENDAÇÕES PARA CORREÇÃO:');
    if (report.brokenImages > 0) {
      console.log('1. Implementar fallback para imagens quebradas no frontend');
      console.log('2. Adicionar placeholder quando imageUrl for null/undefined');
      console.log('3. Considerar cache local de imagens críticas');
    }
    if (report.invalidImages > 0) {
      console.log('4. Validar URLs de imagem antes de salvar no banco');
      console.log('5. Implementar sistema de verificação periódica de imagens');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

async function testSingleImage(imageUrl, product, type, report, category) {
  try {
    // Verificar se a URL é válida
    if (!imageUrl || typeof imageUrl !== 'string') {
      report.invalidImages++;
      report.issues.push({
        productId: product.id,
        productName: product.name,
        issue: `URL de imagem ${type} inválida ou vazia`,
        imageUrl: imageUrl,
        type: type
      });
      console.log(`    ❌ URL inválida (${type})`);
      return;
    }
    
    // Verificar se começa com http/https
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      report.invalidImages++;
      report.issues.push({
        productId: product.id,
        productName: product.name,
        issue: `URL de imagem ${type} não começa com http/https`,
        imageUrl: imageUrl,
        type: type
      });
      console.log(`    ❌ URL não começa com http/https (${type})`);
      return;
    }
    
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
          report.imagesByType[category].working++;
          report.workingImages.push({
            productId: product.id,
            productName: product.name,
            imageUrl: imageUrl,
            status: `${response.status} - ${contentType}`,
            type: type
          });
          console.log(`    ✅ OK (${type}) - ${response.status}`);
        } else {
          report.brokenImages++;
          report.imagesByType[category].broken++;
          report.issues.push({
            productId: product.id,
            productName: product.name,
            issue: `Imagem ${type} não retorna content-type de imagem`,
            imageUrl: imageUrl,
            error: `Content-Type: ${contentType}`,
            type: type
          });
          console.log(`    ⚠️  Não é imagem (${type}) - ${contentType}`);
        }
      } else {
        report.brokenImages++;
        report.imagesByType[category].broken++;
        report.issues.push({
          productId: product.id,
          productName: product.name,
          issue: `Imagem ${type} retornou erro HTTP`,
          imageUrl: imageUrl,
          error: `Status ${response.status}: ${response.statusText}`,
          type: type
        });
        console.log(`    ❌ Erro ${response.status} (${type})`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      report.brokenImages++;
      report.imagesByType[category].broken++;
      report.issues.push({
        productId: product.id,
        productName: product.name,
        issue: `Erro ao acessar imagem ${type}`,
        imageUrl: imageUrl,
        error: fetchError.message,
        type: type
      });
      console.log(`    ❌ Erro de rede (${type}): ${fetchError.message.substring(0, 50)}...`);
    }
    
  } catch (error) {
    report.brokenImages++;
    report.imagesByType[category].broken++;
    report.issues.push({
      productId: product.id,
      productName: product.name,
      issue: `Erro inesperado ao testar imagem ${type}`,
      imageUrl: imageUrl,
      error: error.message,
      type: type
    });
    console.log(`    ❌ Erro inesperado (${type}): ${error.message}`);
  }
}

// Executar o teste final
finalImageTest().catch(console.error);
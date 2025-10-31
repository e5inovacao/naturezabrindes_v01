// Buscar produtos similares às ecobags do segundo print
import fetch from 'node-fetch';

async function findSimilarEcobags() {
  console.log('🔍 Buscando produtos similares às ecobags do segundo print...');
  
  const baseUrl = 'http://localhost:5175/api/products';
  
  try {
    // Buscar sacolas de algodão (que são as mais próximas das ecobags do print)
    console.log('\n🌱 Buscando sacolas de algodão:');
    const sacolaResponse = await fetch(`${baseUrl}?search=sacola&limit=20`);
    const sacolaData = await sacolaResponse.json();
    
    if (sacolaData.success && sacolaData.data && sacolaData.data.items) {
      const sacolas = sacolaData.data.items;
      console.log(`✅ Encontradas ${sacolas.length} sacolas`);
      
      // Filtrar sacolas de algodão que são mais parecidas com ecobags
      const ecobagLikeSacolas = sacolas.filter(product => {
        const name = product.name.toLowerCase();
        return name.includes('algodão') || name.includes('algodao') || 
               name.includes('100%') || name.includes('ecológic');
      });
      
      console.log(`\n🎯 Sacolas similares a ecobags (${ecobagLikeSacolas.length}):`);
      ecobagLikeSacolas.forEach((product, index) => {
        const code = product.supplierCode || product.reference || product.code || product.codigo;
        console.log(`   ${index + 1}. Código: ${code} - ${product.name}`);
        if (product.images && product.images.length > 0) {
          console.log(`      Imagem: ${product.images[0]}`);
        }
      });
      
      // Selecionar os 5 melhores códigos para usar
      const bestCodes = ecobagLikeSacolas.slice(0, 5).map(p => 
        p.supplierCode || p.reference || p.code || p.codigo
      ).filter(code => code);
      
      console.log(`\n✨ Códigos recomendados para usar no Home.tsx:`);
      console.log(`const ecobagCodes = [${bestCodes.map(code => `'${code}'`).join(', ')}];`);
      
      return bestCodes;
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

findSimilarEcobags();
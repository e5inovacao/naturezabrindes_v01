import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔍 Debugando filtro de categoria...');

// Configurar cliente Supabase
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Função para gerar ID consistente (copiada da API)
function generateConsistentEcologicId(data) {
  const baseId = data.codigo || data.id;
  return `ecologic-${baseId}`;
}

// Função para mapear produto (simplificada)
function mapEcologicToProduct(ecologicProduct) {
  const id = generateConsistentEcologicId(ecologicProduct);
  
  // Mapear categoria baseado em palavras-chave
  let category = 'geral';
  const titulo = (ecologicProduct.titulo || '').toLowerCase();
  const descricao = (ecologicProduct.descricao || '').toLowerCase();
  const categoriaOriginal = (ecologicProduct.categoria || '').toLowerCase();
  
  // Lógica de categorização
  if (titulo.includes('caneta') || descricao.includes('caneta') || categoriaOriginal.includes('caneta')) {
    category = 'escrita-papelaria';
  } else if (titulo.includes('caderno') || titulo.includes('agenda') || titulo.includes('bloco')) {
    category = 'papelaria';
  } else if (titulo.includes('bolsa') || titulo.includes('sacola') || titulo.includes('mochila')) {
    category = 'bolsas-acessorios';
  }
  
  return {
    id,
    name: ecologicProduct.titulo || 'Produto sem nome',
    category,
    originalCategory: ecologicProduct.categoria,
    description: ecologicProduct.descricao || ''
  };
}

async function debugCategoryFilter() {
  try {
    console.log('\n📊 Buscando produtos com "caneta" no título ou categoria...');
    
    // Buscar produtos que contenham "caneta"
    const { data: ecologicProducts, error } = await supabaseAdmin
      .from('ecologic_products_site')
      .select('*')
      .or('titulo.ilike.%caneta%,categoria.ilike.%caneta%,descricao.ilike.%caneta%')
      .limit(10);
    
    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return;
    }
    
    console.log(`✅ Encontrados ${ecologicProducts.length} produtos com "caneta"`);
    
    // Mapear produtos
    const mappedProducts = ecologicProducts.map(mapEcologicToProduct);
    
    console.log('\n📋 Produtos mapeados:');
    mappedProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   - ID: ${product.id}`);
      console.log(`   - Categoria mapeada: ${product.category}`);
      console.log(`   - Categoria original: ${product.originalCategory || 'N/A'}`);
    });
    
    console.log('\n🔍 Testando filtro de categoria "canetas"...');
    
    // Testar filtro de categoria
    const filteredByCategory = mappedProducts.filter(product => {
      return product.category.toLowerCase().includes('canetas');
    });
    
    console.log(`\n📊 Resultado do filtro "canetas": ${filteredByCategory.length} produtos`);
    
    if (filteredByCategory.length === 0) {
      console.log('\n⚠️  PROBLEMA IDENTIFICADO: Nenhum produto tem categoria que inclui "canetas"');
      console.log('\n🔧 Categorias encontradas:');
      const uniqueCategories = [...new Set(mappedProducts.map(p => p.category))];
      uniqueCategories.forEach(cat => {
        console.log(`   - ${cat}`);
      });
      
      console.log('\n💡 SOLUÇÃO: O filtro deveria buscar por "escrita" ou "papelaria" em vez de "canetas"');
      
      // Testar filtro correto
      const correctFilter = mappedProducts.filter(product => {
        return product.category.toLowerCase().includes('escrita') || 
               product.category.toLowerCase().includes('papelaria');
      });
      
      console.log(`\n✅ Filtro correto (escrita/papelaria): ${correctFilter.length} produtos`);
      correctFilter.forEach(product => {
        console.log(`   - ${product.name} (${product.category})`);
      });
    }
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

// Executar debug
debugCategoryFilter()
  .then(() => {
    console.log('\n✨ Debug finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
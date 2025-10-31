import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://ixjqvqjqjqjqjqjqjqjq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4anF2cWpxanFqcWpxanFqcWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MzI0NzQsImV4cCI6MjA1MTUwODQ3NH0.Ey8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCanetasFilter() {
  console.log('=== TESTE: Filtro de Canetas Ecológicas ===');
  
  try {
    // Buscar todos os produtos
    const { data: allProducts, error } = await supabase
      .from('ecologic_products_site')
      .select('id, titulo, categoria, descricao')
      .limit(1000);
    
    if (error) throw error;
    
    console.log('Total de produtos no banco:', allProducts.length);
    
    // Filtrar produtos com "caneta"
    const canetas = allProducts.filter(p => {
      const titulo = (p.titulo || '').toLowerCase();
      const descricao = (p.descricao || '').toLowerCase();
      const categoria = (p.categoria || '').toLowerCase();
      
      return titulo.includes('caneta') || descricao.includes('caneta') || categoria.includes('caneta');
    });
    
    console.log('\nProdutos com "caneta" encontrados:', canetas.length);
    
    console.log('\nPrimeiros 5 produtos de canetas:');
    canetas.slice(0, 5).forEach((p, i) => {
      console.log(`${i+1}. ${p.titulo}`);
      console.log(`   Categoria: ${p.categoria || 'NULL'}`);
      console.log(`   ID: ${p.id}`);
      console.log('');
    });
    
    // Separar canetas com e sem categoria
    const canetasComCategoria = canetas.filter(p => p.categoria && p.categoria.trim() !== '');
    const canetasSemCategoria = canetas.filter(p => !p.categoria || p.categoria.trim() === '');
    
    console.log('Canetas COM categoria:', canetasComCategoria.length);
    console.log('Canetas SEM categoria (NULL):', canetasSemCategoria.length);
    
    if (canetasComCategoria.length > 0) {
      console.log('\nExemplos de canetas COM categoria:');
      canetasComCategoria.slice(0, 3).forEach(p => {
        console.log(`- ${p.titulo} (Categoria: ${p.categoria})`);
      });
    }
    
    if (canetasSemCategoria.length > 0) {
      console.log('\nExemplos de canetas SEM categoria:');
      canetasSemCategoria.slice(0, 3).forEach(p => {
        console.log(`- ${p.titulo} (Categoria: NULL)`);
      });
    }
    
    // Testar como o backend classificaria essas canetas
    console.log('\n=== TESTE: Como o backend classificaria as canetas ===');
    
    const officeKeywords = [
      'caneta', 'canetas', 'pen', 'pens',
      'bloco', 'blocos', 'notepad', 'notepads',
      'caderno', 'cadernos', 'notebook', 'notebooks',
      'agenda', 'agendas', 'planner', 'planners',
      'lápis', 'lapis', 'pencil', 'pencils',
      'adesivo', 'adesivos', 'sticker', 'stickers',
      'papel', 'papeis', 'paper',
      'escritório', 'escritorio', 'office',
      'papelaria', 'stationery'
    ];
    
    canetas.slice(0, 5).forEach((produto, i) => {
      const title = (produto.titulo || '').toLowerCase();
      const description = (produto.descricao || '').toLowerCase();
      const combinedText = `${title} ${description}`;
      
      let category = 'ecologicos'; // Categoria padrão
      
      // Verificar categoria explícita
      if (produto.categoria) {
        const categoryStr = produto.categoria.toString().toLowerCase();
        if (categoryStr.includes('papelaria')) {
          category = 'papelaria';
        }
      }
      
      // Mapeamento inteligente baseado em palavras-chave
      if (category !== 'papelaria') {
        const hasOfficeKeyword = officeKeywords.some(keyword => 
          combinedText.includes(keyword)
        );
        
        if (hasOfficeKeyword) {
          category = 'papelaria';
        }
      }
      
      console.log(`${i+1}. ${produto.titulo}`);
      console.log(`   Categoria original: ${produto.categoria || 'NULL'}`);
      console.log(`   Categoria mapeada pelo backend: ${category}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

testCanetasFilter();
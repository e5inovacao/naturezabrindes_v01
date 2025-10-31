// Script para buscar agendas em todas as páginas da API
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function searchAllAgendas() {
  try {
    console.log('🔍 BUSCANDO AGENDAS EM TODAS AS PÁGINAS DA API');
    console.log('='.repeat(60));
    
    let allAgendas = [];
    let currentPage = 1;
    let totalPages = 1;
    
    // Buscar primeira página para obter informações de paginação
    const firstPageResponse = await makeRequest(`http://localhost:5175/api/products?page=1&limit=100`);
    
    if (firstPageResponse.success && firstPageResponse.data) {
      totalPages = firstPageResponse.data.pagination.totalPages;
      console.log(`📄 Total de páginas encontradas: ${totalPages}`);
      console.log(`📦 Total de produtos: ${firstPageResponse.data.pagination.totalItems}`);
      console.log('');
      
      // Buscar todas as páginas
      for (let page = 1; page <= totalPages; page++) {
        console.log(`🔄 Processando página ${page}/${totalPages}...`);
        
        const response = await makeRequest(`http://localhost:5175/api/products?page=${page}&limit=100`);
        
        if (response.success && response.data && response.data.items) {
          const pageAgendas = response.data.items.filter(product => 
            product.name.toLowerCase().includes('agenda')
          );
          
          allAgendas.push(...pageAgendas);
          console.log(`   📅 Agendas encontradas nesta página: ${pageAgendas.length}`);
        }
        
        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('\n' + '='.repeat(60));
      console.log(`🎉 RESULTADO FINAL: ${allAgendas.length} agendas encontradas no total`);
      console.log('='.repeat(60));
      
      // Listar todas as agendas encontradas
      console.log('\n📋 TODAS AS AGENDAS ENCONTRADAS:');
      console.log('-'.repeat(60));
      
      allAgendas.forEach((agenda, index) => {
        console.log(`${index + 1}. ${agenda.name.trim()}`);
        console.log(`   ID: ${agenda.id}`);
        console.log(`   Código: ${agenda.supplierCode || 'N/A'}`);
        console.log('');
      });
      
      // Verificar produtos específicos da imagem
      console.log('\n🎯 VERIFICANDO PRODUTOS ESPECÍFICOS DA IMAGEM:');
      console.log('-'.repeat(60));
      
      const targetProducts = [
        'AGENDA DIÁRIA 2026',
        'Agenda em cortiça',
        'Agenda em cortiça e linho',
        'Agenda A5',
        'Agenda B5'
      ];
      
      targetProducts.forEach(target => {
        const found = allAgendas.filter(agenda => 
          agenda.name.toLowerCase().includes(target.toLowerCase())
        );
        
        if (found.length > 0) {
          console.log(`✅ ENCONTRADO "${target}": ${found.length} produto(s)`);
          found.forEach(item => {
            console.log(`   -> "${item.name.trim()}" (${item.supplierCode})`);
          });
        } else {
          console.log(`❌ NÃO ENCONTRADO: "${target}"`);
        }
        console.log('');
      });
      
      // Buscar especificamente por "DIÁRIA"
      console.log('\n🔍 BUSCANDO POR "DIÁRIA":');
      console.log('-'.repeat(60));
      
      const diarias = allAgendas.filter(agenda => 
        agenda.name.toLowerCase().includes('diária') || 
        agenda.name.toLowerCase().includes('diaria')
      );
      
      if (diarias.length > 0) {
        console.log(`📅 Encontradas ${diarias.length} agendas com "diária":`);
        diarias.forEach(agenda => {
          console.log(`   -> "${agenda.name.trim()}" (${agenda.supplierCode})`);
        });
      } else {
        console.log('❌ Nenhuma agenda com "diária" encontrada');
      }
      
    } else {
      console.log('❌ Erro: Não foi possível obter dados da primeira página');
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar agendas:', error.message);
  }
}

searchAllAgendas();
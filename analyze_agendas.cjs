// Script para analisar agendas retornadas pela API
const https = require('https');
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
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

async function analyzeAgendas() {
  try {
    console.log('📊 ANÁLISE DAS AGENDAS NA API');
    console.log('='.repeat(50));
    
    const apiResponse = await makeRequest('http://localhost:5175/api/products?limit=500');
    
    if (apiResponse.success && apiResponse.data && apiResponse.data.items) {
      const products = apiResponse.data.items;
      
      // Filtrar produtos que contêm 'agenda' no nome
      const agendas = products.filter(product => 
        product.name.toLowerCase().includes('agenda')
      );
      
      console.log(`\n🔍 Total de produtos retornados: ${products.length}`);
      console.log(`📅 Agendas encontradas: ${agendas.length}`);
      console.log('\n📋 LISTA DE AGENDAS:');
      console.log('-'.repeat(50));
      
      agendas.forEach((agenda, index) => {
        console.log(`${index + 1}. ${agenda.name.trim()}`);
        console.log(`   ID: ${agenda.id}`);
        console.log(`   Código: ${agenda.supplierCode || 'N/A'}`);
        console.log(`   Categoria: ${agenda.category}`);
        console.log('');
      });
      
      // Verificar produtos específicos da imagem
      console.log('\n🎯 VERIFICANDO PRODUTOS ESPECÍFICOS DA IMAGEM:');
      console.log('-'.repeat(50));
      
      const targetProducts = [
        'AGENDA DIÁRIA 2026',
        'Agenda em cortiça',
        'Agenda em cortiça e linho'
      ];
      
      targetProducts.forEach(target => {
        const found = products.find(product => 
          product.name.toLowerCase().includes(target.toLowerCase())
        );
        
        if (found) {
          console.log(`✅ ENCONTRADO: "${target}" -> "${found.name.trim()}"`);
        } else {
          console.log(`❌ NÃO ENCONTRADO: "${target}"`);
        }
      });
      
      // Informações de paginação
      if (apiResponse.data.pagination) {
        const pagination = apiResponse.data.pagination;
        console.log('\n📄 INFORMAÇÕES DE PAGINAÇÃO:');
        console.log('-'.repeat(50));
        console.log(`Página atual: ${pagination.currentPage}`);
        console.log(`Total de páginas: ${pagination.totalPages}`);
        console.log(`Total de itens: ${pagination.totalItems}`);
        console.log(`Itens por página: ${pagination.itemsPerPage}`);
        console.log(`Tem próxima página: ${pagination.hasNextPage}`);
      }
      
    } else {
      console.log('❌ Erro: Resposta da API inválida');
    }
  } catch (error) {
    console.error('❌ Erro ao analisar agendas:', error.message);
  }
}

analyzeAgendas();
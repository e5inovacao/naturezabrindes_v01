import React, { useState, useMemo } from 'react';
import { Search, Filter, X, CheckCircle, AlertCircle } from 'lucide-react';

// Mock data para testes
const mockProducts = [
  {
    id: '1',
    name: 'Bolsa Térmica Ecológica',
    description: 'Bolsa térmica sustentável feita com materiais reciclados',
    category: 'Bolsas Térmicas',
    price: 45.90,
    featured: true
  },
  {
    id: '2',
    name: 'Bolsa de Algodão Orgânico',
    description: 'Bolsa ecológica de algodão 100% orgânico',
    category: 'Bolsas',
    price: 25.50,
    featured: false
  },
  {
    id: '3',
    name: 'Bolsa Térmica Premium',
    description: 'Bolsa térmica de alta qualidade com isolamento térmico',
    category: 'Bolsas Térmicas',
    price: 65.00,
    featured: true
  },
  {
    id: '4',
    name: 'Caneca Térmica Bambu',
    description: 'Caneca térmica sustentável feita de bambu',
    category: 'Canecas',
    price: 35.90,
    featured: false
  },
  {
    id: '5',
    name: 'Agenda Ecológica 2024',
    description: 'Agenda sustentável com papel reciclado',
    category: 'Agenda',
    price: 28.90,
    featured: true
  },
  {
    id: '6',
    name: 'Bloco de Notas Sustentável',
    description: 'Bloco de anotações feito com papel reciclado',
    category: 'Blocos e Cadernetas',
    price: 15.90,
    featured: false
  }
];

const categories = [
  'Todas as Categorias',
  'Agenda',
  'Blocos e Cadernetas',
  'Bolsas',
  'Bolsas Térmicas',
  'Canecas'
];

const TestPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [testResults, setTestResults] = useState<Array<{test: string, passed: boolean, details: string}>>([]);

  // Função para normalizar texto (remover acentos)
  const normalizeText = (text: string): string => {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // Lógica de filtragem (similar ao SearchComponent corrigido)
  const filteredProducts = useMemo(() => {
    let filtered = [...mockProducts];

    // Aplicar filtro de busca
    if (searchTerm.trim()) {
      const searchNormalized = normalizeText(searchTerm.trim());
      
      filtered = filtered.filter(product => {
        const productNameNormalized = normalizeText(product.name);
        const productDescriptionNormalized = normalizeText(product.description || '');
        
        // Busca exata por expressão completa (prioridade máxima)
        const exactPhraseMatch = productNameNormalized.includes(searchNormalized) || 
                                 productDescriptionNormalized.includes(searchNormalized);
        
        if (exactPhraseMatch) {
          return true;
        }
        
        // Para expressões com múltiplas palavras, verificar se todas as palavras estão presentes
        const searchWords = searchNormalized.split(' ').filter(word => word.length > 1);
        
        if (searchWords.length > 1) {
          // Todas as palavras devem estar presentes no nome ou descrição
          const allWordsInName = searchWords.every(word => productNameNormalized.includes(word));
          const allWordsInDescription = searchWords.every(word => productDescriptionNormalized.includes(word));
          
          if (allWordsInName || allWordsInDescription) {
            return true;
          }
        }
        
        // Busca por palavras individuais (menor prioridade)
        const partialMatch = searchWords.some(word => 
          productNameNormalized.includes(word) || productDescriptionNormalized.includes(word)
        );
        
        return partialMatch;
      });
    }

    // Aplicar filtro de categoria
    if (selectedCategory && selectedCategory !== 'Todas as Categorias') {
      if (selectedCategory.toLowerCase() === 'bolsas térmicas') {
        // Filtro específico para Bolsas Térmicas
        filtered = filtered.filter(product => {
          const productName = normalizeText(product.name);
          const productDescription = normalizeText(product.description || '');
          return (productName.includes('bolsa') && (productName.includes('termica') || productName.includes('thermal'))) ||
                 (productDescription.includes('bolsa') && (productDescription.includes('termica') || productDescription.includes('thermal')));
        });
      } else if (selectedCategory.toLowerCase() === 'bolsas') {
        // Filtro específico para Bolsas - excluir bolsas térmicas
        filtered = filtered.filter(product => {
          const productName = normalizeText(product.name);
          const productDescription = normalizeText(product.description || '');
          return (productName.includes('bolsa') && !productName.includes('termica') && !productName.includes('thermal')) &&
                 (!productDescription.includes('termica') && !productDescription.includes('thermal'));
        });
      } else {
        // Filtro genérico por categoria
        const categoryLower = selectedCategory.toLowerCase();
        filtered = filtered.filter(product => 
          normalizeText(product.name).includes(categoryLower) ||
          normalizeText(product.category || '').includes(categoryLower) ||
          normalizeText(product.description || '').includes(categoryLower)
        );
      }
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  // Função para executar testes automatizados
  const runTests = () => {
    const tests = [
      {
        test: 'Busca por "bolsa térmica" (expressão exata)',
        searchTerm: 'bolsa térmica',
        category: '',
        expectedCount: 2,
        expectedProducts: ['Bolsa Térmica Ecológica', 'Bolsa Térmica Premium']
      },
      {
        test: 'Filtro "Bolsas Térmicas"',
        searchTerm: '',
        category: 'Bolsas Térmicas',
        expectedCount: 2,
        expectedProducts: ['Bolsa Térmica Ecológica', 'Bolsa Térmica Premium']
      },
      {
        test: 'Filtro "Bolsas" (excluindo térmicas)',
        searchTerm: '',
        category: 'Bolsas',
        expectedCount: 1,
        expectedProducts: ['Bolsa de Algodão Orgânico']
      },
      {
        test: 'Busca por "agenda"',
        searchTerm: 'agenda',
        category: '',
        expectedCount: 1,
        expectedProducts: ['Agenda Ecológica 2024']
      },
      {
        test: 'Busca por "sustentável" (palavra em descrição)',
        searchTerm: 'sustentável',
        category: '',
        expectedCount: 4,
        expectedProducts: ['Bolsa Térmica Ecológica', 'Caneca Térmica Bambu', 'Agenda Ecológica 2024', 'Bloco de Notas Sustentável']
      }
    ];

    const results = tests.map(testCase => {
      // Simular filtros
      let testFiltered = [...mockProducts];
      
      if (testCase.searchTerm.trim()) {
        const searchNormalized = normalizeText(testCase.searchTerm.trim());
        testFiltered = testFiltered.filter(product => {
          const productNameNormalized = normalizeText(product.name);
          const productDescriptionNormalized = normalizeText(product.description || '');
          
          const exactPhraseMatch = productNameNormalized.includes(searchNormalized) || 
                                   productDescriptionNormalized.includes(searchNormalized);
          
          if (exactPhraseMatch) return true;
          
          const searchWords = searchNormalized.split(' ').filter(word => word.length > 1);
          
          if (searchWords.length > 1) {
            const allWordsInName = searchWords.every(word => productNameNormalized.includes(word));
            const allWordsInDescription = searchWords.every(word => productDescriptionNormalized.includes(word));
            if (allWordsInName || allWordsInDescription) return true;
          }
          
          return searchWords.some(word => 
            productNameNormalized.includes(word) || productDescriptionNormalized.includes(word)
          );
        });
      }
      
      if (testCase.category && testCase.category !== 'Todas as Categorias') {
        if (testCase.category.toLowerCase() === 'bolsas térmicas') {
          testFiltered = testFiltered.filter(product => {
            const productName = normalizeText(product.name);
            const productDescription = normalizeText(product.description || '');
            return (productName.includes('bolsa') && (productName.includes('termica') || productName.includes('thermal'))) ||
                   (productDescription.includes('bolsa') && (productDescription.includes('termica') || productDescription.includes('thermal')));
          });
        } else if (testCase.category.toLowerCase() === 'bolsas') {
          testFiltered = testFiltered.filter(product => {
            const productName = normalizeText(product.name);
            const productDescription = normalizeText(product.description || '');
            return (productName.includes('bolsa') && !productName.includes('termica') && !productName.includes('thermal')) &&
                   (!productDescription.includes('termica') && !productDescription.includes('thermal'));
          });
        } else {
          const categoryLower = testCase.category.toLowerCase();
          testFiltered = testFiltered.filter(product => 
            normalizeText(product.name).includes(categoryLower) ||
            normalizeText(product.category || '').includes(categoryLower) ||
            normalizeText(product.description || '').includes(categoryLower)
          );
        }
      }
      
      const passed = testFiltered.length === testCase.expectedCount;
      const foundProducts = testFiltered.map(p => p.name);
      
      return {
        test: testCase.test,
        passed,
        details: `Esperado: ${testCase.expectedCount} produtos [${testCase.expectedProducts.join(', ')}]. Encontrado: ${testFiltered.length} produtos [${foundProducts.join(', ')}]`
      };
    });

    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Página de Testes - Sistema de Filtragem</h1>
          <p className="text-gray-600 mb-6">Interface isolada para testar e validar os mecanismos de busca e filtragem</p>
          
          {/* Controles de Teste */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Campo de Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Termo de Busca
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite um termo para buscar..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Filtro de Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category === 'Todas as Categorias' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Botão de Testes Automatizados */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testes Automatizados
              </label>
              <button
                onClick={runTests}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Executar Testes
              </button>
            </div>
          </div>
          
          {/* Resultados dos Testes */}
          {testResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Resultados dos Testes</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {result.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`font-medium ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
                        {result.test}
                      </span>
                    </div>
                    <p className={`text-sm ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                      {result.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Informações de Filtro Atual */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Filtros Ativos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Busca:</span>
                <span className="ml-2 text-sm text-gray-600">
                  {searchTerm || 'Nenhuma busca ativa'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Categoria:</span>
                <span className="ml-2 text-sm text-gray-600">
                  {selectedCategory || 'Todas as categorias'}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-700">Produtos encontrados:</span>
              <span className="ml-2 text-sm font-semibold text-green-600">
                {filteredProducts.length}
              </span>
            </div>
          </div>
        </div>
        
        {/* Lista de Produtos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Produtos Filtrados</h2>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum produto encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    {product.featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <span className="font-semibold text-green-600">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
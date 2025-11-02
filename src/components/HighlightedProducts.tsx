import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../services/api';
import { Product } from '../../shared/types';
import { Loader2, Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

// Estilo para ocultar scrollbar
const scrollbarHideStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

interface HighlightedProductsProps {
  limit?: number;
}

const HighlightedProducts: React.FC<HighlightedProductsProps> = ({ limit = 6 }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchHighlightedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await productsApi.getHighlightedProducts(limit);
        
        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          setError('Erro ao carregar produtos em destaque');
        }
      } catch (err) {
        console.error('Erro ao buscar produtos em destaque:', err);
        setError('Erro ao carregar produtos em destaque');
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightedProducts();
  }, [limit]);

  const updateScrollButtons = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const scrollLeft = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < maxScrollLeft);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const cardWidth = 324; // 300px (largura do card) + 24px (gap)
      const scrollAmount = cardWidth * 2; // Scroll 2 cards por vez
      
      if (direction === 'left') {
        container.scrollTo({
          left: container.scrollLeft - scrollAmount,
          behavior: 'smooth'
        });
      } else {
        container.scrollTo({
          left: container.scrollLeft + scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  const scrollLeft = () => scroll('left');
  const scrollRight = () => scroll('right');

  useEffect(() => {
    updateScrollButtons();
    
    const container = carouselRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [products]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubra nossa seleção especial de produtos sustentáveis
            </p>
          </div>
          
          <div className="flex gap-8 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {Array.from({ length: limit }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse flex-shrink-0" style={{ width: '300px' }}>
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-gray-600">Nenhum produto em destaque encontrado.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyle }} />
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Produtos em Destaque
            </h2>
          </div>
        </div>
        
        <div className="relative">
          {/* Botões de navegação */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow-lg transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl"
              style={{ marginLeft: '-20px' }}
            >
              <ChevronLeft size={24} />
            </button>
          )}
          
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full shadow-lg transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl"
              style={{ marginRight: '-20px' }}
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Carrossel */}
          <div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {products.map((product) => (
              <Link 
                key={product.id} 
                to={`/produto/${product.id}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group flex-shrink-0 block cursor-pointer"
                style={{ width: '300px' }}
              >
              <div className="relative overflow-hidden">
                <img
                  src={product.images[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-64 object-contain group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-product.jpg';
                  }}
                />


              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                  {product.name}
                </h3>
                

                
                <div className="mt-4">
                  <div className="btn btn-primary btn-lg inline-flex items-center justify-center w-full">
                    <ShoppingCart size={18} className="mr-2" />
                    Ver Produto
                  </div>
                </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link
            to="/catalogo"
            className="inline-flex items-center text-white px-10 py-4 rounded-lg font-semibold text-xl transition-colors shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#2CB20B' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#25a009'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2CB20B'}
          >
            Ver Todos os Produtos
            <ShoppingCart size={22} className="ml-2" />
          </Link>
        </div>
      </div>
      </section>
    </>
  );
};

export default HighlightedProducts;
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './SuggestedGiftsSection.css';
import { Product } from '../../shared/types';
import Card from './Card';

interface SuggestedGiftsSectionProps {
  suggestions: Product[];
}

export default function SuggestedGiftsSection({ suggestions }: SuggestedGiftsSectionProps) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2,
    arrows: true,
    autoplay: false,
    centerMode: false,
    variableWidth: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="py-4 md:py-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 px-4 md:px-0">Sugestões de Brindes</h2>
      <div className="relative suggested-gifts-slider px-2 md:px-0">
        <Slider {...settings}>
        {suggestions.map((product) => (
          <div key={product.id} className="px-1 md:px-2">
            <Card className="hover:shadow-lg transition-shadow mx-1">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-40 md:h-48 object-contain rounded-t-lg"
              />
              <div className="p-2 md:p-4">
                <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 line-clamp-2 text-xs md:text-base leading-tight">{product.name}</h3>
              </div>
            </Card>
          </div>
        ))}
        </Slider>
      </div>
    </div>
  );
}
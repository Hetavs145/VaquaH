import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductCardsCarousel = ({ 
  products, 
  title = "Our Products",
  subtitle = "Discover our range of products",
  autoPlay = true,
  autoPlayInterval = 6000,
  showArrows = true,
  showDots = true,
  className = "",
  maxVisibleCards = 4,
  showHeader = false // New prop to control header visibility
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 },
      '(min-width: 1280px)': { slidesToScroll: 4 }
    }
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Handle auto-play
  useEffect(() => {
    if (!autoPlay || !emblaApi || products.length <= maxVisibleCards) return;

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [emblaApi, autoPlay, autoPlayInterval, products.length, maxVisibleCards]);

  // Update scroll snaps and navigation state
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  // Initialize scroll snaps
  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onInit);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onInit);
    };
  }, [emblaApi, onSelect, onInit]);

  // Navigation functions
  const scrollTo = useCallback((index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!products || products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500 text-lg">No products available</p>
      </div>
    );
  }

  return (
    <section className={`py-8 sm:py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header - Only show if showHeader is true */}
        {showHeader && (
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {title}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
        )}

        {/* Carousel Container */}
        <div className="relative">
          {/* Main Carousel */}
          <div className="embla overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex gap-4 sm:gap-6">
              {products.map((product, index) => (
                <div 
                  key={product._id || product.id || index} 
                  className="embla__slide flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-0.75rem)] lg:flex-[0_0_calc(33.333%-1rem)] xl:flex-[0_0_calc(25%-1.125rem)]"
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {showArrows && products.length > maxVisibleCards && (
            <>
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300 z-10"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300 z-10"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Dots Navigation */}
          {showDots && products.length > maxVisibleCards && (
            <div className="flex justify-center gap-2 mt-8">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedIndex 
                      ? 'bg-blue-500 w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductCardsCarousel;
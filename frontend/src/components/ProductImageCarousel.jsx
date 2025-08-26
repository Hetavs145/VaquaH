import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getPlaceholderImage } from '@/utils/placeholderImage';

const ProductImageCarousel = ({ 
  images, 
  productName, 
  onClose, 
  isModal = false,
  autoPlay = true,
  autoPlayInterval = 5000,
  showThumbnails = true,
  showDots = true,
  showArrows = true,
  className = ""
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Handle auto-play
  useEffect(() => {
    if (!autoPlay || !emblaApi || images.length <= 1) return;

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [emblaApi, autoPlay, autoPlayInterval, images.length]);

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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        scrollNext();
      } else if (e.key === 'Escape' && isModal) {
        onClose?.();
      }
    };

    if (isModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [scrollPrev, scrollNext, isModal, onClose]);

  // Handle touch/swipe for mobile
  const handleTouchStart = useCallback((e) => {
    // Prevent default touch behavior to avoid conflicts with embla
    e.preventDefault();
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <img 
          src={getPlaceholderImage()} 
          alt="No images available" 
          className="w-32 h-32 object-contain opacity-50"
        />
        <p className="text-gray-500 mt-4">No images available</p>
      </div>
    );
  }

  return (
    <div className={`relative ${isModal ? 'fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center' : 'w-full'} ${className}`}>
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 p-2 rounded-full"
        >
          <X size={24} />
        </button>
      )}
      
      <div className={`relative ${isModal ? 'max-w-4xl max-h-[90vh]' : 'w-full'}`}>
        {/* Main Carousel */}
        <div className="embla overflow-hidden rounded-lg" ref={emblaRef}>
          <div className="embla__container flex">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="embla__slide flex-[0_0_100%] min-w-0 relative"
                onTouchStart={handleTouchStart}
              >
                <img
                  src={image}
                  alt={`${productName} - Image ${index + 1}`}
                  className={`w-full h-auto object-contain ${
                    isModal ? 'max-h-[80vh]' : 'max-h-96'
                  }`}
                  onError={(e) => {
                    e.target.src = getPlaceholderImage();
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {showArrows && images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isModal ? 'p-3' : 'p-2'
              }`}
            >
              <ChevronLeft size={isModal ? 24 : 20} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isModal ? 'p-3' : 'p-2'
              }`}
            >
              <ChevronRight size={isModal ? 24 : 20} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {/* Dots Navigation */}
        {showDots && images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
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

        {/* Thumbnail Navigation */}
        {showThumbnails && images.length > 1 && (
          <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === selectedIndex 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = getPlaceholderImage();
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageCarousel;
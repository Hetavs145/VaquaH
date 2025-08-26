import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getPlaceholderImage } from '@/utils/placeholderImage';

const ImageCarousel = ({ images, productName, onClose, isModal = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const thumbsContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
      } else if (e.key === 'Escape' && isModal) {
        onClose?.();
      }
    };

    if (isModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [images.length, isModal, onClose]);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <img 
          src={getPlaceholderImage()} 
          alt="No images available" 
          className="w-32 h-32 object-contain opacity-50"
        />
        <p className="text-gray-500 mt-4">No images available</p>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
  };

  const prevImage = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
    if (thumbsContainerRef.current && isMobile) {
      const thumb = thumbsContainerRef.current.children[index];
      thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  };

  return (
    <div className={`${isModal ? 'fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4' : 'w-full'}`}>
      {isModal && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>
      )}
      <div className={`${isModal ? 'max-w-5xl w-full' : 'w-full'}`}>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_100px] md:grid-cols-[100px_minmax(0,1fr)]'} gap-4`}>
          {/* Thumbs left on desktop */}
          {!isMobile && (
            <div className="order-1 md:order-none flex md:flex-col gap-2 overflow-auto md:max-h-96">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    index === currentIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = getPlaceholderImage(); }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="relative overflow-hidden rounded-lg bg-gray-50 order-none">
            <img
              src={images[currentIndex]}
              alt={`${productName} - Image ${currentIndex + 1}`}
              className={`${isModal ? 'max-h-[70vh]' : 'max-h-96'} w-full h-auto object-contain`}
              onError={(e) => { e.currentTarget.src = getPlaceholderImage(); }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* Horizontal thumbs on mobile */}
        {isMobile && images.length > 1 && (
          <div ref={thumbsContainerRef} className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = getPlaceholderImage(); }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;
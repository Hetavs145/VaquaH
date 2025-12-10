import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productService } from '@/services/firestoreService';
import { imageUploadService } from '@/services/imageUploadService';
import ProductCard from './ProductCard';

const ProductCarousel = ({ title = "Our Products", subtitle, maxProducts = 8, products: propProducts }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        let items;
        if (propProducts) {
          // Use products passed as prop
          items = propProducts;
        } else {
          // Fetch featured products
          items = await productService.getFeaturedProducts();
        }

        // Process products to ensure proper image handling
        const processedItems = (items || []).map(product => {
          const images = (product.images || [product.image || product.imageUrl]).filter(Boolean);
          return {
            ...product,
            image: images[0],
            images
          };
        });

        setProducts(processedItems.slice(0, maxProducts));
      } catch (e) {
        console.error('Failed to load products for carousel', e);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [maxProducts, propProducts]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, products.length - getVisibleCount()));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, products.length - getVisibleCount()) : prev - 1
    );
  };

  const getVisibleCount = () => {
    if (window.innerWidth < 640) return 1; // Mobile: 1 product
    if (window.innerWidth < 768) return 2; // Small tablet: 2 products
    if (window.innerWidth < 1024) return 3; // Tablet: 3 products
    if (window.innerWidth < 1280) return 4; // Small desktop: 4 products
    return 5; // Large desktop: 5 products
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + getVisibleCount());

  if (loading) {
    return (
      <section className="bg-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">Loading products...</div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        {title && (
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Carousel Container */}
        <div className="product-carousel">
          {/* Navigation Arrows */}
          {products.length > getVisibleCount() && (
            <>
              <button
                onClick={prevSlide}
                className="carousel-nav-button left-0 -translate-x-4"
                aria-label="Previous products"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="carousel-nav-button right-0 translate-x-4"
                aria-label="Next products"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id || product._id} {...product} />
            ))}
          </div>

          {/* Carousel Indicators */}
          {products.length > getVisibleCount() && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(products.length / getVisibleCount()) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * getVisibleCount())}
                  className={`w-2 h-2 rounded-full transition-all ${Math.floor(currentIndex / getVisibleCount()) === index
                    ? 'bg-vaquah-blue'
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

export default ProductCarousel;
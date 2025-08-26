import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productService } from '@/services/firestoreService';
import { imageUploadService } from '@/services/imageUploadService';

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
          <div className="product-carousel-grid">
            {visibleProducts.map((product) => (
              <div
                key={product.id || product._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group"
              >
                {/* Product Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-50 h-56 sm:h-64 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTEwQzExMC41IDExMCAxMTkgMTAxLjUgMTE5IDkxQzExOSA4MC41IDExMC41IDcyIDEwMCA3MkM4OS41IDcyIDgxIDgwLjUgODEgOTFDODEgMTAxLjUgODkuNSAxMTAgMTAwIDExMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMzBDMTEwLjUgMTMwIDExOSAxMjEuNSAxMTkgMTExQzExOSAxMDAuNSAxMTAuNSA5MiAxMDAgOTJDODkuNSA5MiA4MSAxMDAuNSA4MSAxMTFDODEgMTIxLjUgODkuNSAxMzAgMTAwIDEzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                    }}
                  />
                  
                  {/* Image count indicator */}
                  {product.images && product.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      +{product.images.length - 1} more
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 text-gray-800 group-hover:text-vaquah-blue transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.floor(product.rating || 4.5) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">
                      {product.rating || 4.5}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg text-vaquah-blue">
                      ₹{(product.price || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* View Details Button */}
                  <Link
                    to={`/products/${product.id || product._id}`}
                    className="block w-full bg-vaquah-blue hover:bg-vaquah-dark-blue text-white text-center py-2 px-4 rounded-md transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          {products.length > getVisibleCount() && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(products.length / getVisibleCount()) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * getVisibleCount())}
                  className={`w-2 h-2 rounded-full transition-all ${
                    Math.floor(currentIndex / getVisibleCount()) === index
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
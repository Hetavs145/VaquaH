import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import ProductCardsCarousel from './ProductCardsCarousel';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productService } from '@/services/firestoreService';
import { imageUploadService } from '@/services/imageUploadService';

const FeaturedProducts = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const items = await productService.getFeaturedProducts();
        
        // Process products to ensure proper image handling
        const processedItems = (items || []).map(product => {
          // Get images from multiple sources with priority order
          let productImages = [];
          
          // First, try to get from localStorage
          const localImages = imageUploadService.getAllImagesFromLocal(product.id || product._id);
          
          // Then, try to get from product.images array
          const dbImages = product.images || [];
          
          // Finally, try to get from product.imageUrl or product.image
          const mainImage = product.imageUrl || product.image;
          
          // Combine all sources, prioritizing localStorage, then database, then main image
          if (localImages.length > 0) {
            productImages = localImages;
          } else if (dbImages.length > 0) {
            productImages = dbImages;
          } else if (mainImage) {
            productImages = [mainImage];
          }
          
          return {
            ...product,
            // Use the first image as the main image
            image: productImages[0] || '',
            // Store all images in the images array
            images: productImages
          };
        });
        
        setFeatured(processedItems.slice(0, 6));
      } catch (e) {
        console.error('Failed to load featured products', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="bg-gray-50 section-padding">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Featured Products</h2>
            <p className="text-gray-600 text-sm sm:text-base">Handpicked air conditioners for your ultimate comfort</p>
          </div>
          <Link to="/products">
            <Button variant="link" className="text-vaquah-blue hover:text-vaquah-dark-blue flex items-center text-sm sm:text-base">
              View All <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 text-sm sm:text-base">Loading featured products...</div>
        ) : featured.length === 0 ? (
          <div className="text-center text-gray-500 text-sm sm:text-base">No featured products yet. Check back soon.</div>
        ) : (
          <ProductCardsCarousel
            products={featured}
            showHeader={false}
            autoPlay={true}
            autoPlayInterval={6000}
            showArrows={true}
            showDots={true}
            maxVisibleCards={4}
          />
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;

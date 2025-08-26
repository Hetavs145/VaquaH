import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productService } from '@/services/firestoreService';
import { imageUploadService } from '@/services/imageUploadService';
import { getPlaceholderImage } from '@/utils/placeholderImage';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCarousel from '@/components/ProductCarousel';

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const items = await productService.getAllProducts();
        
        // Process products to ensure proper image handling
        const processedItems = (items || []).map(product => {
          // Get images from localStorage if available
          const localImages = imageUploadService.getAllImagesFromLocal(product.id || product._id);
          
          return {
            ...product,
            // Use local images if available, otherwise use the stored image
            image: localImages[0] || product.image || product.imageUrl,
            images: localImages.length > 0 ? localImages : (product.images || [product.image || product.imageUrl]).filter(Boolean)
          };
        });
        
        setProducts(processedItems);
      } catch (error) {
        console.error('Failed to load products:', error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add products to your cart",
        variant: "destructive",
      });
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    
    addToCart(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-vaquah-light-blue to-blue-100 py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 font-sans leading-tight" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'}}>
              Our Products
            </h1>
            <p className="text-gray-600 text-center max-w-3xl mx-auto text-base sm:text-lg px-2">
              Discover our range of energy-efficient split ACs designed for Indian homes and climate.
              Built with advanced technology for optimal cooling and electricity savings.
            </p>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No products found.</div>
            ) : (
              <ProductCarousel 
                title="All Products"
                subtitle="Browse our complete collection of air conditioners and cooling solutions"
                maxProducts={products.length}
                products={products}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;

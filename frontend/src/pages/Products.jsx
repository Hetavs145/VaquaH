import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/firestoreService';
import { imageUploadService } from '@/services/imageUploadService';
import { getPlaceholderImage } from '@/utils/placeholderImage';
import ProductCardsCarousel from '@/components/ProductCardsCarousel';

const normalize = (doc) => {
  // Get images from multiple sources
  const images = doc.images || [];
  const mainImage = doc.image || doc.imageUrl || '';
  
  let finalImages = [];
  if (images.length > 0) {
    finalImages = images;
  } else if (mainImage) {
    finalImages = [mainImage];
  } else {
    // Try to get from local storage
    const localImages = imageUploadService.getAllImagesFromLocal(doc.id);
    finalImages = localImages.length > 0 ? localImages : [getPlaceholderImage()];
  }

  return {
    id: doc.id,
    _id: doc.id,
    name: doc.name,
    price: doc.price,
    rating: doc.rating || 4.5,
    image: finalImages[0] || getPlaceholderImage(),
    images: finalImages,
    description: doc.description || '',
    features: doc.features || [],
    brand: doc.brand || 'VaquaH',
    energyRating: doc.energyRating || '5',
    tonnage: doc.tonnage || 1.5,
    inverter: doc.inverter ?? true,
  };
};

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await productService.getAllProducts();
        const filtered = (all || []).filter(doc => {
          const name = (doc?.name || '').toLowerCase();
          const brand = (doc?.brand || '').toLowerCase();
          const image = (doc?.image || doc?.imageUrl || '').toLowerCase();
          return !(
            name.includes('vaquah inverter split ac 1.5 ton') ||
            name.includes('inverter split ac 1.5 ton') ||
            brand.includes('mitshubishi') ||
            image.includes('511929539_hkrzpkg') ||
            image.includes('as2.ftcdn.net/jpg/05/11/92/95')
          );
        });
        setProducts(filtered.map(normalize));
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleProductClick = (id) => {
    navigate(`/products/${id}`);
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
              <ProductCardsCarousel
                products={products}
                title="Our Products"
                subtitle="Discover our range of energy-efficient split ACs designed for Indian homes and climate"
                autoPlay={false}
                showArrows={true}
                showDots={true}
                maxVisibleCards={4}
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

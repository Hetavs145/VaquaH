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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {loading ? (
                <div className="col-span-full text-center text-gray-500 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-8">No products found.</div>
              ) : products.map((product) => (
                <div 
                  key={product._id || product.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 h-40 sm:h-48 flex items-center justify-center relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="object-contain h-full w-full p-4"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = getPlaceholderImage();
                      }} 
                    />
                    {product.images && product.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        +{product.images.length - 1} more
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="text-yellow-400 text-sm sm:text-base">★★★★☆</div>
                      <span className="text-xs sm:text-sm text-gray-500 ml-1">{product.rating}</span>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="font-bold text-base sm:text-lg">₹{product.price.toLocaleString()}</span>
                      <Button 
                        onClick={(e) => handleAddToCart(e, product)} 
                        size="sm" 
                        className="bg-vaquah-blue hover:bg-vaquah-dark-blue w-full sm:w-auto"
                      >
                        <ShoppingCart size={16} className="mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;

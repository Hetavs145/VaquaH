import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, ShoppingCart, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/firestoreService';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [expandedSpec, setExpandedSpec] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const doc = await productService.getProductById(id);
        if (doc) {
          // Normalize fields that UI expects
          const images = Array.isArray(doc.images) ? doc.images : [];
          const primaryImage = doc.imageUrl || images[0] || doc.image || '/images/product1.jpg';
          const normalized = {
            _id: doc.id,
            name: doc.name,
            price: doc.price,
            rating: doc.rating || 4.5,
            image: primaryImage,
            images: images.length ? images : [primaryImage],
            description: doc.description || '',
            features: doc.features || [],
            specifications: doc.specifications || {},
            brand: doc.brand || 'VaquaH',
            category: doc.category || 'Air Conditioners',
            countInStock: doc.countInStock ?? 10,
            numReviews: doc.numReviews || 0,
          };
          setProduct(normalized);
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error('Failed to load product', e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleQuantityChange = (value) => {
    if (value >= 1 && value <= 5) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl">Product not found!</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Carousel className="relative">
                <CarouselContent>
                  {product.images.map((src, idx) => (
                    <CarouselItem key={idx}>
                      <div className="w-full flex items-center justify-center">
                        <img
                          src={src}
                          alt={`${product.name} ${idx+1}`}
                          className="w-full h-auto object-contain rounded-lg"
                          style={{ maxHeight: '400px' }}
                          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious aria-label="Previous" />
                <CarouselNext aria-label="Next" />
              </Carousel>
              {product.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {product.images.slice(0,10).map((thumb, i) => (
                    <img key={i} src={thumb} alt={`thumb ${i+1}`} className="w-16 h-16 object-cover rounded border" />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    size={16} 
                    fill={i < Math.floor(product.rating) ? "#FFC107" : "none"}
                    stroke={i < Math.floor(product.rating) ? "#FFC107" : "#E2E8F0"}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{product.rating} ({product.numReviews} reviews)</span>
              </div>

              <p className="text-3xl font-bold text-vaquah-blue mb-4">₹{product.price.toLocaleString()}</p>
              
              <p className="text-gray-700 mb-6">{product.description}</p>
              
              <div className="flex items-center mb-6">
                <div className="border border-gray-300 rounded-md flex items-center mr-4">
                  <button 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <Button 
                  onClick={handleAddToCart}
                  className="bg-vaquah-blue hover:bg-vaquah-dark-blue"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Cart
                </Button>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Availability:</span> 
                  {product.countInStock > 0 ? (
                    <span className="text-green-600 ml-2">In Stock ({product.countInStock} units)</span>
                  ) : (
                    <span className="text-red-600 ml-2">Out of Stock</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Brand:</span> 
                  <span className="ml-2">{product.brand}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Category:</span> 
                  <span className="ml-2">{product.category}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedSpec(!expandedSpec)}
              >
                <h2 className="text-xl font-bold">Specifications</h2>
                {expandedSpec ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {expandedSpec && (
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 border-b border-gray-100 py-2">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedFeatures(!expandedFeatures)}
              >
                <h2 className="text-xl font-bold">Features</h2>
                {expandedFeatures ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {expandedFeatures && (
                <ul className="mt-4 space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check size={18} className="text-green-500 mr-2 mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;

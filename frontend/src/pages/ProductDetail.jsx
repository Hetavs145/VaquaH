import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/firestoreService';
import { imageUploadService } from '@/services/imageUploadService';
import ImageCarousel from '@/components/ImageCarousel';
import { getPlaceholderImage } from '@/utils/placeholderImage';
import ReviewCard from '@/components/ReviewCard';

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
          // Get images from Firestore/Storage
          const images = (doc.images || []).filter(Boolean);
          const mainImage = doc.image || doc.imageUrl || '';

          const finalImages = images.length > 0 ? images : (mainImage ? [mainImage] : [getPlaceholderImage()]);

          // Normalize fields that UI expects
          const normalized = {
            _id: doc.id,
            name: doc.name,
            price: doc.price,
            rating: doc.rating || 0,
            image: finalImages[0] || getPlaceholderImage(),
            images: finalImages,
            description: doc.description || '',
            features: doc.features || [],
            specifications: doc.specifications || {},
            brand: doc.brand || 'VaquaH',
            category: doc.category || 'Air Conditioners',
            inStock: doc.inStock, // Primary source of truth from Admin Panel
            countInStock: doc.countInStock,
            stock: doc.stock,
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

  // Review State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Fetch reviews
  useEffect(() => {
    if (product?.id || product?._id) {
      loadReviews();
    }
  }, [product?.id, product?._id]);

  const loadReviews = async () => {
    try {
      const { reviewService } = await import('@/services/firestoreService');
      const productId = product.id || product._id;
      const fetchedReviews = await reviewService.getProductReviews(productId);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

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
            <div className="bg-white p-6 rounded-lg shadow-sm relative">
              {/* Inline image carousel with horizontal thumbnails on mobile */}
              <ImageCarousel
                images={product.images}
                productName={product.name}
                isModal={false}
              />
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
                  disabled={!product.inStock && !product.countInStock && !product.stock}
                  className={`
                    ${(!product.inStock && !product.countInStock && !product.stock)
                      ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-vaquah-blue hover:bg-vaquah-dark-blue'}
                  `}
                >
                  <ShoppingCart size={18} className="mr-2" />
                  {(!product.inStock && !product.countInStock && !product.stock) ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Availability:</span>
                  {(product.inStock || product.countInStock > 0 || product.stock > 0) ? (
                    <span className="text-green-600 ml-2">In Stock</span>
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
          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={{
                      ...review,
                      type: 'product'
                    }}
                    className="border border-gray-100 shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;

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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
            rating: doc.rating || 4.5,
            image: finalImages[0] || getPlaceholderImage(),
            images: finalImages,
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

  // Review State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  // Fetch reviews
  useEffect(() => {
    if (product?._id) {
      loadReviews();
    }
  }, [product?._id]);

  const loadReviews = async () => {
    try {
      const { reviewService } = await import('@/services/firestoreService');
      const fetchedReviews = await reviewService.getProductReviews(product._id);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to write a review.",
        variant: "destructive"
      });
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    setSubmittingReview(true);

    try {
      // Verify purchase
      const { orderService } = await import('@/services/firestoreService');
      const orders = await orderService.getUserOrders(user.uid);

      const hasPurchased = orders.some(order =>
        // Check if order contains this product and is delivered/completed
        order.items?.some(item => item._id === product._id || item.productId === product._id) &&
        ['delivered', 'completed'].includes(order.status?.toLowerCase())
      );

      if (!hasPurchased) {
        toast({
          title: "Verification Failed",
          description: "You can only review products you have purchased and received.",
          variant: "destructive"
        });
        setSubmittingReview(false);
        return;
      }

      // Submit review
      const { reviewService } = await import('@/services/firestoreService');
      await reviewService.addProductReview({
        userId: user.uid,
        productId: product._id,
        name: user.displayName || 'Verified Buyer',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        quote: reviewForm.comment, // for compatibility
        createdAt: new Date()
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      setIsReviewDialogOpen(false);
      setReviewForm({ rating: 5, comment: '' });
      loadReviews(); // Reload reviews

      // Update local product state to reflect new rating immediately (optimistic update)
      // In a real app, we might want to re-fetch the product or calculate locally
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingReview(false);
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
          {/* Reviews Section */}
          <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              <Button
                onClick={() => setIsReviewDialogOpen(true)}
                className="bg-vaquah-blue hover:bg-vaquah-dark-blue"
              >
                Write a Review
              </Button>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-2">No reviews yet.</p>
                <p className="text-sm text-gray-400">Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < review.rating ? "#FFC107" : "none"}
                            stroke={i < review.rating ? "#FFC107" : "#E2E8F0"}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900 mr-2">{review.name}</span>
                      <span className="text-xs text-gray-500">
                        {review.createdAt?.seconds
                          ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
                          : 'Just now'}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.quote || review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your thoughts on the {product.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReviewSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      fill={star <= reviewForm.rating ? "#FFC107" : "none"}
                      stroke={star <= reviewForm.rating ? "#FFC107" : "#CBD5E1"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                required
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="What did you like or dislike?"
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={submittingReview} className="bg-vaquah-blue hover:bg-vaquah-dark-blue">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProductDetail;

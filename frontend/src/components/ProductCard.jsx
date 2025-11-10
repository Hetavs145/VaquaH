import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { getPlaceholderImage } from '@/utils/placeholderImage';

const ProductCard = ({
  id,
  _id,
  name,
  brand,
  price,
  originalPrice,
  image,
  imageUrl,
  rating,
  energyRating,
  tonnage,
  inverter,
  specifications,
  features,
}) => {
  const navigate = useNavigate();
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Use _id if available, otherwise fall back to id
  const productId = _id || id;
  
  // Handle image source - prioritize image prop, then imageUrl, then placeholder
  const imageSource = image || imageUrl || getPlaceholderImage();
  
  // Build specification badges from specifications object when available
  const specEntries = specifications && typeof specifications === 'object'
    ? Object.entries(specifications).filter(([_, v]) => v != null && String(v).trim() !== '')
    : [];
  const specBadges = specEntries.length > 0
    ? specEntries.map(([_, v]) => String(v)).slice(0, 3)
    : [
        tonnage ? `${tonnage} Ton` : null,
        energyRating ? `${energyRating} Star` : null,
        inverter != null ? (inverter ? 'Inverter' : 'Non-Inverter') : null,
      ].filter(Boolean);
  const safeRating = typeof rating === 'number' ? rating : 4.2;

  const handleAddToCart = () => {
    // Create a product object from the props with all required properties
    const product = {
      _id: productId,
      name,
      brand,
      price,
      image: imageSource,
      rating: safeRating,
      energyRating,
      tonnage,
      inverter,
      specifications,
      features,
      // Adding missing required properties
      description: `${brand} ${name} ${tonnage} Ton ${inverter ? 'Inverter' : 'Non-Inverter'} AC`,
      category: 'Air Conditioner',
      countInStock: 10, // Default value
      numReviews: 0,    // Default value
    };
    
    // Add to cart with a quantity of 1
    addToCart(product, 1);
    
    // Show success toast
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`,
    });
  };

  const handleImageError = (e) => {
    e.target.src = getPlaceholderImage();
  };
  
  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-3 sm:p-4 relative cursor-pointer"
      onClick={() => navigate(`/products/${productId}`)}
    >
      {/* Wishlist button */}
      <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100">
        <Heart size={16} className="text-gray-400 hover:text-vaquah-orange" />
      </button>
      
      {/* Discount tag */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 bg-vaquah-orange text-white text-xs font-bold px-2 py-1 rounded">
          {discount}% OFF
        </div>
      )}
      
      {/* Product image */}
      <Link to={`/products/${productId}`}>
        <div className="mb-3 p-2 sm:p-4 flex justify-center">
          <img 
            src={imageSource} 
            alt={name} 
            className="h-56 sm:h-64 object-contain hover:scale-105 transition-transform"
            onError={handleImageError}
          />
        </div>
      </Link>
      
      {/* Brand */}
      <div className="text-xs text-gray-500 mb-1">{brand}</div>
      
      {/* Product name */}
      <Link to={`/products/${productId}`} className="hover:text-vaquah-blue">
        <h3 className="font-medium text-gray-800 mb-2 h-12 sm:h-14 overflow-hidden text-sm sm:text-base">{name}</h3>
      </Link>
      
      {/* Specifications */}
      {specBadges.length > 0 && (
        <div className="grid grid-cols-2 gap-1 mb-3">
          {specBadges.map((text, i) => (
            <div key={i} className="flex items-center text-xs text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">{text}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Rating */}
      <div className="flex items-center mb-2">
        <div className="bg-green-50 text-green-700 py-0.5 px-2 rounded flex items-center">
          <Star size={12} sm:size={14} fill="currentColor" className="mr-1" />
          <span className="text-xs sm:text-sm font-medium">{safeRating}</span>
        </div>
      </div>
      
      {/* Price */}
      <div className="mb-3">
        <div className="flex items-center">
          <span className="text-base sm:text-lg font-bold">₹{price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-xs sm:text-sm text-gray-400 line-through ml-2">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">Free Delivery</div>
      </div>
      
      {/* Call to action */}
      <Button 
        className="w-full flex items-center justify-center bg-vaquah-blue hover:bg-vaquah-dark-blue text-sm sm:text-base"
        onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
      >
        <ShoppingCart size={14} sm:size={16} className="mr-2" />
        Add to Cart
      </Button>
    </div>
  );
};

export default ProductCard;

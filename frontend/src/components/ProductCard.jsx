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
  numReviews = 0,
  inStock = true,
}) => {
  const navigate = useNavigate();
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { toast } = useToast();

  // Use _id if available, otherwise fall back to id
  const productId = _id || id;

  // Handle image source - prioritize image prop, then imageUrl, then placeholder
  const imageSource = image || imageUrl || getPlaceholderImage();

  // Helper to get spec value case-insensitively
  const getSpecValue = (keys) => {
    if (!specifications || typeof specifications !== 'object') return null;
    const specKeys = Object.keys(specifications);
    for (const key of keys) {
      const foundKey = specKeys.find(k => k.toLowerCase().includes(key.toLowerCase()));
      if (foundKey) return specifications[foundKey];
    }
    return null;
  };

  const displayTonnage = tonnage || getSpecValue(['Capacity', 'Tonnage']);
  const displayEnergy = energyRating || getSpecValue(['Energy', 'Star']);
  const displayInverter = inverter !== undefined && inverter !== null
    ? inverter
    : (getSpecValue(['Inverter', 'Compressor', 'Technology'])?.toString().toLowerCase().includes('inverter'));

  // Build specification badges
  // If we have explicit display values, use them. Otherwise fall back to first few specs.
  const specBadges = [
    displayTonnage ? (String(displayTonnage).toLowerCase().includes('ton') ? displayTonnage : `${displayTonnage} Ton`) : null,
    displayEnergy ? (String(displayEnergy).toLowerCase().includes('star') ? displayEnergy : `${displayEnergy} Star`) : null,
    displayInverter != null ? (displayInverter ? 'Inverter' : 'Non-Inverter') : null,
  ].filter(Boolean);

  // If no standard badges found, try to use raw specs
  if (specBadges.length === 0 && specifications && typeof specifications === 'object') {
    Object.entries(specifications).slice(0, 3).forEach(([_, v]) => {
      if (v) specBadges.push(String(v));
    });
  }
  const safeRating = typeof rating === 'number' ? rating : 0;

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
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-3 sm:p-4 relative cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/products/${productId}`)}
    >
      {/* Wishlist button */}
      <button
        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 z-10"
        onClick={(e) => {
          e.stopPropagation();
          if (isInWishlist(productId)) {
            removeFromWishlist(productId);
            toast({ title: "Removed from wishlist", description: `${name} removed.` });
          } else {
            addToWishlist({
              _id: productId,
              name,
              brand,
              price,
              originalPrice,
              image: imageSource,
              rating: safeRating,
              energyRating,
              tonnage,
              inverter,
              specifications,
              features,
              description: `${brand} ${name} ${tonnage} Ton ${inverter ? 'Inverter' : 'Non-Inverter'} AC`,
              category: 'Air Conditioner',
              countInStock: 10,
              numReviews: 0,
            });
            toast({ title: "Added to wishlist", description: `${name} saved for later.` });
          }
        }}
      >
        <Heart
          size={16}
          className={`${isInWishlist(productId) ? 'text-vaquah-orange fill-vaquah-orange' : 'text-gray-400 hover:text-vaquah-orange'}`}
        />
      </button>

      {/* Discount tag */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 bg-vaquah-orange text-white text-xs font-bold px-2 py-1 rounded z-10">
          {discount}% OFF
        </div>
      )}

      {/* Product image */}
      <Link to={`/products/${productId}`} className="block">
        <div className="mb-3 p-2 sm:p-4 flex justify-center">
          <img
            src={imageSource}
            alt={name}
            className="h-56 sm:h-64 object-contain hover:scale-105 transition-transform"
            onError={handleImageError}
          />
        </div>
      </Link>

      {/* Content Wrapper */}
      <div className="flex flex-col flex-grow">
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

        {/* Bottom Section - Rating, Price, Button */}
        <div className="mt-auto">
          {/* Rating */}
          <div className="flex items-center mb-2">
            {numReviews > 0 ? (
              <>
                <div className="bg-green-50 text-green-700 py-0.5 px-2 rounded flex items-center">
                  <Star size={12} sm:size={14} fill="currentColor" className="mr-1" />
                  <span className="text-xs sm:text-sm font-medium">{rating}</span>
                </div>
                <span className="text-xs text-gray-400 ml-1">({numReviews})</span>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">No reviews yet</span>
            )}
          </div>

          {/* Price and Button Section */}
          <div className="pt-2">
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
              className={`w-full flex items-center justify-center text-sm sm:text-base ${!inStock
                ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-vaquah-blue hover:bg-vaquah-dark-blue'
                }`}
              disabled={!inStock}
              onClick={(e) => {
                e.stopPropagation();
                if (inStock) handleAddToCart();
              }}
            >
              <ShoppingCart size={14} sm:size={16} className="mr-2" />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

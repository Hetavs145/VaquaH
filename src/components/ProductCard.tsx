
import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

export interface ProductProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  energyRating: string;
  tonnage: number;
  inverter: boolean;
}

const ProductCard: React.FC<ProductProps> = ({
  id,
  name,
  brand,
  price,
  originalPrice,
  image,
  rating,
  energyRating,
  tonnage,
  inverter,
}) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = () => {
    // Create a product object from the props with all required properties
    const product = {
      _id: id,
      name,
      brand,
      price,
      image,
      rating,
      energyRating,
      tonnage,
      inverter,
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
  
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 relative">
      {/* Wishlist button */}
      <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100">
        <Heart size={18} className="text-gray-400 hover:text-vaquah-orange" />
      </button>
      
      {/* Discount tag */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 bg-vaquah-orange text-white text-xs font-bold px-2 py-1 rounded">
          {discount}% OFF
        </div>
      )}
      
      {/* Product image */}
      <Link to={`/products/${id}`}>
        <div className="mb-3 p-4 flex justify-center">
          <img 
            src={image} 
            alt={name} 
            className="h-48 object-contain hover:scale-105 transition-transform"
          />
        </div>
      </Link>
      
      {/* Brand */}
      <div className="text-xs text-gray-500 mb-1">{brand}</div>
      
      {/* Product name */}
      <Link to={`/products/${id}`} className="hover:text-vaquah-blue">
        <h3 className="font-medium text-gray-800 mb-2 h-12 overflow-hidden">{name}</h3>
      </Link>
      
      {/* Specifications */}
      <div className="grid grid-cols-2 gap-1 mb-3">
        <div className="flex items-center text-xs text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">
            {tonnage} Ton
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">
            {energyRating} Star
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">
            {inverter ? 'Inverter' : 'Non-Inverter'}
          </span>
        </div>
      </div>
      
      {/* Rating */}
      <div className="flex items-center mb-2">
        <div className="bg-green-50 text-green-700 py-0.5 px-2 rounded flex items-center">
          <Star size={14} fill="currentColor" className="mr-1" />
          <span className="text-sm font-medium">{rating}</span>
        </div>
      </div>
      
      {/* Price */}
      <div className="mb-3">
        <div className="flex items-center">
          <span className="text-lg font-bold">₹{price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through ml-2">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">Free Delivery</div>
      </div>
      
      {/* Call to action */}
      <Button 
        className="w-full flex items-center justify-center bg-vaquah-blue hover:bg-vaquah-dark-blue"
        onClick={handleAddToCart}
      >
        <ShoppingCart size={16} className="mr-2" />
        Add to Cart
      </Button>
    </div>
  );
};

export default ProductCard;

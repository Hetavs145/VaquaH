
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { ShoppingCart, ChevronLeft, TruckIcon, ShieldCheck, Award } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

// Sample product data (in a real app, this would come from an API)
const productData = [
  {
    id: '1',
    name: 'VaquaH Inverter Split AC 1.5 Ton',
    price: 32999,
    rating: 4.5,
    image: '/products/ac1.jpg',
    description: 'Energy efficient inverter AC with cooling capacity of 1.5 tons. Suitable for medium-sized rooms.',
    features: ['3 Star Energy Rating', 'Copper Condenser Coil', 'Anti-dust Filter', 'Auto Restart'],
    specifications: {
      capacity: '1.5 Ton',
      energyRating: '3 Star',
      powerConsumption: '1400W',
      coolantType: 'R32 (Environment Friendly)',
      noiseLevel: '26 dB',
      warranty: '1 Year on Product, 5 Years on Compressor'
    }
  },
  {
    id: '2',
    name: 'VaquaH Inverter Split AC 2 Ton',
    price: 41999,
    rating: 4.7,
    image: '/products/ac2.jpg',
    description: 'High capacity inverter AC for large rooms with superior cooling performance and low noise operation.',
    features: ['4 Star Energy Rating', 'Dual Inverter', 'PM 2.5 Filter', '100% Copper with Ocean Black Protection'],
    specifications: {
      capacity: '2 Ton',
      energyRating: '4 Star',
      powerConsumption: '1800W',
      coolantType: 'R32 (Environment Friendly)',
      noiseLevel: '28 dB',
      warranty: '1 Year on Product, 10 Years on Compressor'
    }
  },
  {
    id: '3',
    name: 'VaquaH Window AC 1 Ton',
    price: 23999,
    rating: 4.2,
    image: '/products/ac3.jpg',
    description: 'Compact window AC suitable for small rooms. Easy installation and maintenance.',
    features: ['3 Star Energy Rating', 'Auto Clean Function', 'Anti-bacterial Filter', 'LED Display'],
    specifications: {
      capacity: '1 Ton',
      energyRating: '3 Star',
      powerConsumption: '1200W',
      coolantType: 'R32 (Environment Friendly)',
      noiseLevel: '30 dB',
      warranty: '1 Year on Product, 5 Years on Compressor'
    }
  },
  {
    id: '4',
    name: 'VaquaH Portable AC 1 Ton',
    price: 18999,
    rating: 4.0,
    image: '/products/ac4.jpg',
    description: 'Versatile portable AC that can be moved between rooms. No installation required.',
    features: ['Self-Evaporative System', 'Dehumidifier Function', 'Remote Control', 'Sleep Mode'],
    specifications: {
      capacity: '1 Ton',
      energyRating: '3 Star',
      powerConsumption: '1100W',
      coolantType: 'R410A',
      noiseLevel: '35 dB',
      warranty: '1 Year on Product, 3 Years on Compressor'
    }
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const product = productData.find(p => p.id === id);
  
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
        <Button onClick={() => navigate('/products')}>
          <ChevronLeft size={16} className="mr-2" />
          Back to Products
        </Button>
      </div>
    </div>;
  }
  
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add products to your cart",
        variant: "destructive",
      });
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    addToCart(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };
  
  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to proceed with purchase",
        variant: "destructive",
      });
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => navigate('/products')}
          >
            <ChevronLeft size={16} className="mr-2" />
            Back to Products
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="bg-white p-8 border border-gray-200 rounded-lg flex items-center justify-center">
              <img 
                src={product.image || "/placeholder.svg"} 
                alt={product.name} 
                className="object-contain max-h-72 w-full"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }} 
              />
            </div>
            
            {/* Product Details */}
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 mr-2">★★★★☆</div>
                <span className="text-sm text-gray-500">{product.rating} Rating</span>
              </div>
              
              <div className="text-3xl font-bold mb-6">₹{product.price.toLocaleString()}</div>
              
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Key Features:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  onClick={handleAddToCart} 
                  variant="outline" 
                  className="flex-1"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleBuyNow} 
                  className="bg-vaquah-blue hover:bg-vaquah-dark-blue flex-1"
                >
                  Buy Now
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="border border-gray-200 rounded p-3">
                  <TruckIcon size={20} className="mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-gray-500">Across India</p>
                </div>
                <div className="border border-gray-200 rounded p-3">
                  <ShieldCheck size={20} className="mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Warranty</p>
                  <p className="text-xs text-gray-500">1 Year Product + 5 Year Compressor</p>
                </div>
                <div className="border border-gray-200 rounded p-3">
                  <Award size={20} className="mx-auto mb-2 text-orange-600" />
                  <p className="text-sm font-medium">Energy Efficient</p>
                  <p className="text-xs text-gray-500">3+ Star Rating</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Specifications */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Technical Specifications</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <tr key={key} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="py-3 px-4 font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                      <td className="py-3 px-4 text-gray-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;

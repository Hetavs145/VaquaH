
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    features: ['3 Star Energy Rating', 'Copper Condenser Coil', 'Anti-dust Filter', 'Auto Restart']
  },
  {
    id: '2',
    name: 'VaquaH Inverter Split AC 2 Ton',
    price: 41999,
    rating: 4.7,
    image: '/products/ac2.jpg',
    description: 'High capacity inverter AC for large rooms with superior cooling performance and low noise operation.',
    features: ['4 Star Energy Rating', 'Dual Inverter', 'PM 2.5 Filter', '100% Copper with Ocean Black Protection']
  },
  {
    id: '3',
    name: 'VaquaH Window AC 1 Ton',
    price: 23999,
    rating: 4.2,
    image: '/products/ac3.jpg',
    description: 'Compact window AC suitable for small rooms. Easy installation and maintenance.',
    features: ['3 Star Energy Rating', 'Auto Clean Function', 'Anti-bacterial Filter', 'LED Display']
  },
  {
    id: '4',
    name: 'VaquaH Portable AC 1 Ton',
    price: 18999,
    rating: 4.0,
    image: '/products/ac4.jpg',
    description: 'Versatile portable AC that can be moved between rooms. No installation required.',
    features: ['Self-Evaporative System', 'Dehumidifier Function', 'Remote Control', 'Sleep Mode']
  }
];

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState(productData);

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
        <section className="bg-gradient-to-r from-vaquah-light-blue to-blue-100 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Our Products</h1>
            <p className="text-gray-600 text-center max-w-3xl mx-auto">
              Discover our range of energy-efficient split ACs designed for Indian homes and climate.
              Built with advanced technology for optimal cooling and electricity savings.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 h-48 flex items-center justify-center">
                    <img 
                      src={product.image || "/placeholder.svg"} 
                      alt={product.name} 
                      className="object-contain h-full w-full p-4"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }} 
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="text-yellow-400">★★★★☆</div>
                      <span className="text-sm text-gray-500 ml-1">{product.rating}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
                      <Button 
                        onClick={(e) => handleAddToCart(e, product)} 
                        size="sm" 
                        className="bg-vaquah-blue hover:bg-vaquah-dark-blue"
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


import React from 'react';
import ProductCard, { ProductProps } from './ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Sample product data
const featuredProducts: ProductProps[] = [
  {
    id: "1",
    name: "VaquaH Pro Inverter Split AC 1.5 Ton with Dual Filtration",
    brand: "VaquaH",
    price: 32999,
    originalPrice: 42999,
    image: "/images/product1.jpg",
    rating: 4.6,
    energyRating: "5",
    tonnage: 1.5,
    inverter: true
  },
  {
    id: "2",
    name: "VaquaH Super Cool 3-Star Window AC 1.0 Ton",
    brand: "VaquaH",
    price: 24999,
    originalPrice: 29999,
    image: "/images/product2.jpg",
    rating: 4.2,
    energyRating: "3",
    tonnage: 1.0,
    inverter: false
  },
  {
    id: "3",
    name: "VaquaH Ultimate Inverter Split AC 2.0 Ton with Air Purification",
    brand: "VaquaH",
    price: 48999,
    originalPrice: 54999,
    image: "/images/product3.jpg",
    rating: 4.8,
    energyRating: "5",
    tonnage: 2.0,
    inverter: true
  },
  {
    id: "4",
    name: "VaquaH Essential Inverter Split AC 1.0 Ton Energy Saver",
    brand: "VaquaH",
    price: 28999,
    originalPrice: 35999,
    image: "/images/product4.jpg",
    rating: 4.5,
    energyRating: "4",
    tonnage: 1.0,
    inverter: true
  },
];

const FeaturedProducts = () => {
  return (
    <section className="bg-gray-50 section-padding">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured Products</h2>
            <p className="text-gray-600">Handpicked air conditioners for your ultimate comfort</p>
          </div>
          <Link to="/products">
            <Button variant="link" className="text-vaquah-blue hover:text-vaquah-dark-blue flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

import React from 'react';
import HeroSection from '@/components/HeroSection';
import ProductCarousel from '@/components/ProductCarousel';
import FeaturedProducts from '@/components/FeaturedProducts';
import ServiceSection from '@/components/ServiceSection';
import TestimonialSection from '@/components/TestimonialSection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProductCarousel 
        title="Our Products"
        subtitle="Discover our range of energy-efficient split ACs designed for Indian homes and climate. Built with advanced technology for optimal cooling and electricity savings."
        maxProducts={8}
      />
      <FeaturedProducts />
      <ServiceSection />
      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Index;

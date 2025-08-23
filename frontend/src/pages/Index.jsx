import React from 'react';
import HeroSection from '@/components/HeroSection';
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
      <FeaturedProducts />
      <ServiceSection />
      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Index;

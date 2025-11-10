import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Shipping = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Shipping Information</h1>
      <p className="text-gray-700">We offer doorstep delivery in supported pin codes. Delivery timelines vary by location.</p>
    </main>
    <Footer />
  </div>
);

export default Shipping;


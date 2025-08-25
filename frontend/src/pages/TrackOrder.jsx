import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TrackOrder = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
      <p className="text-gray-700">Order tracking will be available once your order is processed.</p>
    </main>
    <Footer />
  </div>
);

export default TrackOrder;


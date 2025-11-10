import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Returns = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Returns & Refunds</h1>
      <p className="text-gray-700">Returns are accepted for unused products within 7 days of delivery as per policy.</p>
    </main>
    <Footer />
  </div>
);

export default Returns;


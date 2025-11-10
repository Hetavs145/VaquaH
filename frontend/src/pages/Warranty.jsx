import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Warranty = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Warranty Policy</h1>
      <p className="text-gray-700">Standard manufacturer warranty applies to all products. Service warranties are provided as per job-card.</p>
    </main>
    <Footer />
  </div>
);

export default Warranty;


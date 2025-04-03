import React from 'react';
import Navbar from '@/components/Navbar';

const Products = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Products</h1>
          <p className="text-xl text-gray-600 mb-4">Check out our amazing products!</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            Return to Home
          </a>
        </div>
      </div>
    </>
  );
};

export default Products;

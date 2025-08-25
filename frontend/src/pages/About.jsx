import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-4">About VaquaH</h1>
          <p className="text-gray-700 max-w-3xl">
            VaquaH delivers premium split AC products and professional services across India, focusing on energy efficiency, reliable installation, and timely support.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;


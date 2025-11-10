import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-700 mb-2">Phone: +91 9999999999</p>
          <p className="text-gray-700 mb-2">Email: vaquah.contact@gmail.com</p>
          <p className="text-gray-700">Address: Vadodara Gujarat -390023, India</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;


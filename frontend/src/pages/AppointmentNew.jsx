import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceListing from '@/components/ServiceListing';

const AppointmentNew = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-vaquah-blue text-white py-16 animate-fade-in">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">Schedule a Service</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Choose from our range of professional services. Book online and get priority support.
          </p>
          <p className="mt-4 text-sm bg-white/10 inline-block px-4 py-2 rounded-full backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Need help? Contact us at <a href="mailto:contact@vaquah.in" className="underline hover:text-blue-200">contact@vaquah.in</a>
          </p>
        </div>
      </div>

      <div className="container-custom py-12 flex-1">
        <ServiceListing />
      </div>

      <Footer />
    </div>
  );
};



export default AppointmentNew;
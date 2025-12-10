import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contracts = () => {
  const handleRequestQuote = () => {
    const subject = "Request for Custom Service Quotation";
    const body = "I am interested in a custom service contract. Please provide more details regarding...";
    window.location.href = `mailto:contact@vaquah.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* Hero Section */}
      <div className="bg-vaquah-blue text-white py-16 animate-fade-in">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">Annual Maintenance Contracts</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Protect your ACs with our comprehensive maintenance plans. Priority service, regular checkups, and peace of mind.
          </p>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Contract Benefits */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Why Choose Our Annual Maintenance?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-4">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Priority Service</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Skip the queue! Contract members get priority scheduling for all service calls and emergency repairs.</p>
              </div>
              <div className="text-center p-4">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Regular Maintenance</h3>
                <p className="text-sm text-gray-600 leading-relaxed">We proactively schedule maintenance visits to ensure your systems run efficiently and prevent breakdowns.</p>
              </div>
              <div className="text-center p-4">
                <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Cost Savings</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Enjoy exclusive discounts on spare parts, labor charges, and new equipment purchases.</p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={handleRequestQuote}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 md:text-lg transition-all"
              >
                Get a Custom Quote
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contracts; 
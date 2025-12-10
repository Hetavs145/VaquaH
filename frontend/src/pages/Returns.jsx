import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, AlertCircle, Mail, CheckCircle } from 'lucide-react';

const Returns = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-vaquah-blue text-white py-20 animate-fade-in">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">Returns & Refunds</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Simple and hassle-free return policy.
            </p>
          </div>
        </div>

        <div className="container-custom section-padding">
          {/* Refund Notice - User Requested */}
          <div className="bg-blue-50 border-l-4 border-vaquah-blue p-6 mb-12 rounded-r-lg shadow-sm animate-slide-up">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-vaquah-blue flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Need a Refund or Cancellation?</h3>
                <p className="text-gray-700 leading-relaxed">
                  In case of any discrepancy with your order, or if you wish to claim a refund for an order/service cancellation, please email us directly at <a href="mailto:contact@vaquah.in" className="font-semibold text-vaquah-blue hover:underline">contact@vaquah.in</a> with your Order ID and the issue details. Our team will process your request promptly.
                </p>
              </div>
            </div>
          </div>

          {/* Return Process Steps */}
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-800">Easy Return Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: <Mail size={32} />, title: "1. Contact Us", desc: "Email contact@vaquah.in within 7 days of delivery." },
              { icon: <RotateCcw size={32} />, title: "2. Ship It Back", desc: "We'll arrange a pickup or provide shipping instructions." },
              { icon: <CheckCircle size={32} />, title: "3. Get Refunded", desc: "Refund initiated within 48 hours of inspection." }
            ].map((step, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-700">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Policy Details */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">Return Policy Details</h2>
            <div className="space-y-6 text-gray-600">
              <p>
                We accept returns for most products within <strong>7 days of delivery</strong> if they are unused, in their original packaging, and in the same condition that you received them.
              </p>
              <h3 className="text-lg font-semibold text-gray-800">Non-Returnable Items:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Perishable goods.</li>
                <li>Customized or personalized items.</li>
                <li>Items marked as "Final Sale".</li>
                <li>Services that have already been completed.</li>
              </ul>
              <p className="mt-4">
                Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Returns;

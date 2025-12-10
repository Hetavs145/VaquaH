import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Clock, PenTool, ThumbsUp } from 'lucide-react';

const Warranty = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-vaquah-blue text-white py-20 animate-fade-in">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">Warranty & Guarantee</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Peace of mind with every service and product.
            </p>
          </div>
        </div>

        <div className="container-custom section-padding">
          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-vaquah-blue">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-bold mb-2">100% Secure</h3>
                <p className="text-sm text-gray-600">All transactions and services are fully protected.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <Clock size={24} />
                </div>
                <h3 className="font-bold mb-2">30-Day Service Warranty</h3>
                <p className="text-sm text-gray-600">Issues within 30 days? We fix it for free.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                  <PenTool size={24} />
                </div>
                <h3 className="font-bold mb-2">Manufacturer Warranty</h3>
                <p className="text-sm text-gray-600">Full support for product warranty claims.</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                  <ThumbsUp size={24} />
                </div>
                <h3 className="font-bold mb-2">Satisfaction Guarantee</h3>
                <p className="text-sm text-gray-600">Not happy? We'll make it right.</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Terms */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">Warranty Terms & Conditions</h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-vaquah-blue">Service Warranty</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  VaquaH provides a 30-day warranty on all repair and installation services. This covers any defects in workmanship or issues directly related to the service performed.
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Warranty period begins from the date of service completion.</li>
                  <li>Covers labor and parts supplied by VaquaH.</li>
                  <li>Does not cover issues caused by misuse, accidental damage, or pre-existing conditions not related to the service.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-vaquah-blue">Product Warranty</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Products sold by VaquaH come with the standard manufacturer's warranty. We assist our customers in claiming these warranties.
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Warranty duration varies by product and manufacturer.</li>
                  <li>Please retain your invoice as proof of purchase.</li>
                  <li>Physical damage or liquid damage is typically not covered under standard warranty.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-vaquah-blue">How to Claim</h3>
                <p className="text-gray-600 leading-relaxed">
                  To file a warranty claim, please contact our support team via the <a href="/contact" className="text-vaquah-blue hover:underline">Contact page</a> or email us at contact@vaquah.in with your Order/Service ID and a description of the issue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Warranty;

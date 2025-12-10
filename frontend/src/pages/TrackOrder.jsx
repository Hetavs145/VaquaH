import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, ArrowRight } from 'lucide-react';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      navigate(`/orders/${orderId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-vaquah-blue text-white py-20 animate-fade-in">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">Track Your Order</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Enter your Order ID to get real-time status updates.
            </p>
          </div>
        </div>

        <div className="container-custom section-padding">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none shadow-xl -mt-20 relative z-10 animate-scale-in">
              <CardContent className="p-8 md:p-12">
                <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter Order ID (e.g., ORD-12345)"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="pl-10 h-12 text-lg"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-12 px-8 bg-vaquah-blue hover:bg-vaquah-dark-blue text-white font-medium text-lg transition-all hover:scale-105"
                  >
                    Track Order
                  </Button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-4">
                  You can find your Order ID in the confirmation email.
                </p>
              </CardContent>
            </Card>

            {/* Features / Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-vaquah-blue">
                  <Package size={28} />
                </div>
                <h3 className="font-bold mb-2">Real-Time Updates</h3>
                <p className="text-sm text-gray-600">Know exactly where your package is at every step.</p>
              </div>
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <ArrowRight size={28} />
                </div>
                <h3 className="font-bold mb-2">Fast Delivery</h3>
                <p className="text-sm text-gray-600">We partner with top couriers to ensure timely delivery.</p>
              </div>
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                  <Search size={28} />
                </div>
                <h3 className="font-bold mb-2">Easy Tracking</h3>
                <p className="text-sm text-gray-600">Simple and transparent tracking process.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackOrder;

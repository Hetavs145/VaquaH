import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Package, Clock, MapPin } from 'lucide-react';

const Shipping = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-vaquah-blue text-white py-20 animate-fade-in">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">Shipping & Delivery</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Fast, reliable, and transparent delivery for all your orders.
            </p>
          </div>
        </div>

        <div className="container-custom section-padding">
          {/* Delivery Steps */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>

              {[
                { icon: <Package size={32} />, title: "Order Placed", desc: "We receive your order and confirm details." },
                { icon: <Clock size={32} />, title: "Processing", desc: "Your items are packed with care." },
                { icon: <Truck size={32} />, title: "Shipped", desc: "On the way to your doorstep." },
                { icon: <MapPin size={32} />, title: "Delivered", desc: "Enjoy your new product!" }
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-20 h-20 bg-white rounded-full border-4 border-vaquah-blue flex items-center justify-center text-vaquah-blue mb-4 shadow-lg z-10">
                    {step.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Policy Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Truck className="text-vaquah-blue" /> Shipping Rates
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex justify-between border-b pb-2">
                    <span>Standard Shipping (Orders above ₹999)</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Standard Shipping (Orders below ₹999)</span>
                    <span className="font-semibold">₹50</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Express Delivery</span>
                    <span className="font-semibold">₹150</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="text-vaquah-blue" /> Delivery Timelines
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex justify-between border-b pb-2">
                    <span>Metro Cities</span>
                    <span className="font-semibold">2-4 Business Days</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Rest of India</span>
                    <span className="font-semibold">5-7 Business Days</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Remote Areas</span>
                    <span className="font-semibold">7-10 Business Days</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shipping;

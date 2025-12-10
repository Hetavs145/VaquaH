import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, ShieldCheck } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-vaquah-blue text-white py-20 animate-fade-in">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">About VaquaH</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Your trusted partner for home services and premium products.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="container-custom section-padding">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Story</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Founded with a vision to simplify home maintenance, VaquaH has grown from a small local service provider to a comprehensive platform for home solutions. We understand the challenges of finding reliable technicians and quality products, which is why we've built a ecosystem that delivers both.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our journey is driven by a commitment to excellence and customer satisfaction. Every service we provide and every product we sell is backed by our guarantee of quality.
              </p>
            </div>
            <div className="flex-1 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Placeholder for About Image */}
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <Users size={64} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="bg-white py-20">
          <div className="container-custom">
            <div className="text-center mb-16 animate-slide-up">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Why Choose Us</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're not just a service provider; we're your partners in maintaining a comfortable home.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-vaquah-blue animate-float">
                    <Target size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                  <p className="text-gray-600">
                    To provide accessible, high-quality home services and products that enhance your living experience.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-float" style={{ animationDelay: '1s' }}>
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Quality Guarantee</h3>
                  <p className="text-gray-600">
                    We stand by our work. All our services come with a satisfaction guarantee and warranty support.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600 animate-float" style={{ animationDelay: '2s' }}>
                    <Users size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Expert Team</h3>
                  <p className="text-gray-600">
                    Our technicians are verified, trained, and experienced professionals dedicated to solving your problems.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;

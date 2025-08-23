import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-vaquah-light-blue to-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Image first in DOM and visually - this should be LCP */}
          <div className="order-1 flex justify-center">
            <div className="hero-image-container">
              <img 
                src="https://images.unsplash.com/photo-1621617003570-050caddcba61?auto=format&fit=crop&q=80&w=800" 
                alt="Modern Split AC Unit" 
                width="800"
                height="533"
                loading="eager"
                fetchpriority="high"
                className="hero-image" 
              />
            </div>
          </div>

          {/* Text content second */}
          <div className="order-2 hero-text-content">
            <h1 className="text-4xl md:text-5xl font-bold text-vaquah-dark-blue mb-4 font-sans leading-tight" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'}}>
              Beat the Heat with Premium Split ACs
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Experience ultimate cooling comfort with energy-efficient split air conditioners. 
              Get expert installation and maintenance services.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <Button 
                className="bg-vaquah-blue hover:bg-vaquah-dark-blue text-white"
                onClick={() => navigate('/products')}
              >
                Shop Now <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="border-vaquah-blue text-vaquah-blue hover:bg-vaquah-light-blue"
                onClick={() => navigate('/appointments/new')}
              >
                Book a Service
              </Button>
            </div>

            {/* Static content to prevent CLS */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-full shadow-sm mr-3 w-8 h-8 flex items-center justify-center">❄️</div>
                <span className="text-sm font-medium">Energy Efficient</span>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-full shadow-sm mr-3 w-8 h-8 flex items-center justify-center">🛡️</div>
                <span className="text-sm font-medium">5 Year Warranty</span>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-full shadow-sm mr-3 w-8 h-8 flex items-center justify-center">⏱️</div>
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

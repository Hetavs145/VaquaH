
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Snowflake, ShieldCheck, Clock } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-vaquah-light-blue to-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-vaquah-dark-blue mb-4">
              Beat the Heat with Premium Split ACs
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Experience ultimate cooling comfort with energy-efficient split air conditioners. 
              Get expert installation and maintenance services.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <Button className="bg-vaquah-blue hover:bg-vaquah-dark-blue text-white">
                Shop Now <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button variant="outline" className="border-vaquah-blue text-vaquah-blue hover:bg-vaquah-light-blue">
                Book a Service
              </Button>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-full shadow-sm mr-3">
                  <Snowflake size={20} className="text-vaquah-blue" />
                </div>
                <span className="text-sm font-medium">Energy Efficient</span>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-full shadow-sm mr-3">
                  <ShieldCheck size={20} className="text-vaquah-blue" />
                </div>
                <span className="text-sm font-medium">5 Year Warranty</span>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-full shadow-sm mr-3">
                  <Clock size={20} className="text-vaquah-blue" />
                </div>
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1621617003570-050caddcba61?auto=format&fit=crop&q=80&w=800" 
              alt="Modern Split AC Unit" 
              className="max-w-full h-auto rounded-lg shadow-lg" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

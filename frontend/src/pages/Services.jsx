import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Thermometer, 
  Settings, 
  Clipboard, 
  Zap, 
  RefreshCcw, 
  Shield, 
  Clock,
  ChevronRight 
} from 'lucide-react';

const Services = () => {
  const services = [
    {
      id: 1,
      name: 'AC Installation',
      description: 'Professional installation service for all types of AC units with proper calibration and testing.',
      icon: <Wrench className="h-8 w-8 text-vaquah-blue" />,
      price: '₹1,500 onwards',
      image: '/images/service1.jpg'
    },
    {
      id: 2,
      name: 'Regular Servicing',
      description: 'Complete AC service including cleaning, filter replacement, and performance check.',
      icon: <Settings className="h-8 w-8 text-vaquah-blue" />,
      price: '₹899 onwards',
      image: '/images/service2.jpg'
    },
    {
      id: 3,
      name: 'Repair & Troubleshooting',
      description: 'Expert diagnosis and repair for all AC issues with genuine spare parts.',
      icon: <Thermometer className="h-8 w-8 text-vaquah-blue" />,
      price: '₹599 onwards (+ parts)',
      image: '/images/service3.jpg'
    },
    {
      id: 4,
      name: 'Annual Maintenance Contract',
      description: 'Year-round protection with scheduled servicing and priority support.',
      icon: <Clipboard className="h-8 w-8 text-vaquah-blue" />,
      price: '₹2,999/year',
      image: '/images/service4.jpg'
    },
    {
      id: 5,
      name: 'Gas Refilling',
      description: 'Proper gas refilling with leak detection and system pressure testing.',
      icon: <Zap className="h-8 w-8 text-vaquah-blue" />,
      price: '₹1,299 onwards',
      image: '/images/service5.jpg'
    },
    {
      id: 6,
      name: 'Relocation Service',
      description: 'Safe uninstallation, transportation, and reinstallation of your AC unit.',
      icon: <RefreshCcw className="h-8 w-8 text-vaquah-blue" />,
      price: '₹2,999 onwards',
      image: '/images/service6.jpg'
    },
    {
      id: 7,
      name: 'Extended Warranty',
      description: 'Extended protection beyond manufacturer warranty with comprehensive coverage.',
      icon: <Shield className="h-8 w-8 text-vaquah-blue" />,
      price: '₹1,999/year',
      image: '/images/service7.jpg'
    },
    {
      id: 8,
      name: 'Emergency Repairs',
      description: '24/7 emergency repair service with priority attendance.',
      icon: <Clock className="h-8 w-8 text-vaquah-blue" />,
      price: '₹1,099 onwards',
      image: '/images/service8.jpg'
    }
  ];

  const whyChooseUs = [
    {
      title: 'Certified Technicians',
      description: 'All our technicians are fully certified and receive regular training.'
    },
    {
      title: 'Genuine Spare Parts',
      description: 'We use only genuine spare parts with proper warranty.'
    },
    {
      title: '90-Day Service Warranty',
      description: 'All our repair work comes with a 90-day service warranty.'
    },
    {
      title: 'Transparent Pricing',
      description: 'No hidden charges. We provide detailed estimates before starting work.'
    },
    {
      title: 'Scheduled Appointments',
      description: 'Choose a time slot that works for you. We respect your schedule.'
    },
    {
      title: 'Safety Protocols',
      description: 'Our technicians follow strict safety and hygiene protocols.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-r from-vaquah-light-blue to-blue-100 py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Professional AC Services for Your Comfort</h1>
              <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 px-2">
                From installation to maintenance, our expert technicians ensure your AC units 
                perform at their best throughout the year.
              </p>
              <Link to="/appointments/new">
                <Button className="bg-vaquah-blue hover:bg-vaquah-dark-blue text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto">
                  Book a Service Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Services section */}
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Our Services</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {services.map((service) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="mb-4 h-40 sm:h-48 overflow-hidden rounded-lg">
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4">{service.description}</p>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                    <span className="font-semibold text-vaquah-blue text-sm sm:text-base">{service.price}</span>
                    <Link to="/appointments/new">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-sm">
                        Book Now <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process section */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-vaquah-blue rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg sm:text-xl">1</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Book an Appointment</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Choose a service and select your preferred date and time slot.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-vaquah-blue rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg sm:text-xl">2</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Expert Visit</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Our certified technician will arrive at your location with all necessary equipment.
                </p>
              </div>
              
              <div className="text-center sm:col-span-2 lg:col-span-1">
                <div className="bg-vaquah-blue rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg sm:text-xl">3</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Service & Support</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Get your AC serviced with a warranty and follow-up support.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-8 sm:mt-12">
              <Link to="/appointments/new">
                <Button className="bg-vaquah-blue hover:bg-vaquah-dark-blue w-full sm:w-auto">
                  Schedule Service
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Why Choose VaquaH Services</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {whyChooseUs.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-8 sm:py-12 lg:py-16 bg-vaquah-blue text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Keep Your AC in Perfect Condition?</h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Our expert technicians are ready to help you with any AC service needs.
              Schedule a service today and experience the VaquaH difference.
            </p>
            <Link to="/appointments/new">
              <Button className="bg-white text-vaquah-blue hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto">
                Book Your Service Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;

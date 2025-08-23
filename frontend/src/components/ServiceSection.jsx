import React from 'react';
import { ArrowRight, RotateCw, Wrench, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServiceSection = () => {
  const services = [
    {
      id: 1,
      title: 'AC Installation',
      description: 'Professional installation by certified technicians ensuring optimal performance and longevity.',
      icon: <Zap size={40} className="text-vaquah-blue" />,
      link: '/services/installation',
      image: '/images/service1.jpg'
    },
    {
      id: 2,
      title: 'Annual Maintenance',
      description: 'Regular servicing and maintenance to keep your AC running efficiently throughout the year.',
      icon: <RotateCw size={40} className="text-vaquah-blue" />,
      link: '/services/maintenance',
      image: '/images/service2.jpg'
    },
    {
      id: 3,
      title: 'Repair Services',
      description: 'Quick and reliable repair services for all types of AC problems by experienced technicians.',
      icon: <Wrench size={40} className="text-vaquah-blue" />,
      link: '/services/repair',
      image: '/images/service3.jpg'
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Our Professional Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Keep your air conditioner in perfect condition with our comprehensive service packages.
            Our certified technicians ensure optimal performance all year round.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4 h-48 overflow-hidden rounded-lg">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              <div className="mb-5">{service.icon}</div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <Link to={service.link}>
                <Button variant="link" className="text-vaquah-blue hover:text-vaquah-dark-blue p-0 flex items-center">
                  Learn More <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/services">
            <Button className="bg-vaquah-blue hover:bg-vaquah-dark-blue">
              View All Services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;

import React from 'react';
import { ArrowRight, RotateCw, Wrench, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { marketingService } from '@/services/marketingService';

const ServiceSection = () => {
  const [services, setServices] = React.useState([]);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      const items = await marketingService.getServices();
      if (!isMounted) return;
      const iconMap = {
        zap: <Zap size={40} className="text-vaquah-blue" />,
        rotate: <RotateCw size={40} className="text-vaquah-blue" />,
        wrench: <Wrench size={40} className="text-vaquah-blue" />,
      };
      const normalized = (items || []).map((it, idx) => ({
        id: it.id || idx + 1,
        title: it.title || it.name || 'Service',
        description: it.description || '',
        icon: it.iconKey && iconMap[it.iconKey] ? iconMap[it.iconKey] : null,
        link: it.link || '/services',
        image: it.imageUrl || it.image || '',
      }));
      setServices(normalized.slice(0, 3));
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Our Professional Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Keep your air conditioner in perfect condition with our comprehensive service packages.
            Our certified technicians ensure optimal performance all year round.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow card-hover"
            >
              <div className="mb-4 h-48 overflow-hidden rounded-lg">
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
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

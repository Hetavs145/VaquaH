import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { marketingService } from '@/services/marketingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import BookingDialog from '@/components/BookingDialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const ServiceSection = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const items = await marketingService.getServices();
        if (!isMounted) return;
        setServices(items.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleBookClick = (service) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to schedule an appointment',
        variant: 'destructive'
      });
      navigate('/login', { state: { from: '/' } });
      return;
    }
    setSelectedService(service);
    setIsDialogOpen(true);
  };

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
            <Card key={service.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full overflow-hidden group">
              <div className="h-48 overflow-hidden relative">
                <Link to={`/services/${service.id}`}>
                  <img
                    src={service.imageUrl || 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?w=500&auto=format&fit=crop&q=60'}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-vaquah-blue shadow-sm">
                    Starts ₹{service.price}
                  </div>
                </Link>
              </div>
              <CardHeader>
                <Link to={`/services/${service.id}`}>
                  <CardTitle className="text-xl text-gray-800 hover:text-vaquah-blue transition-colors mb-1">{service.name}</CardTitle>
                </Link>
                <div className="flex items-center mb-2">
                  {service.numReviews > 0 ? (
                    <>
                      <div className="bg-green-50 text-green-700 py-0.5 px-2 rounded flex items-center">
                        <Star size={12} fill="currentColor" className="mr-1" />
                        <span className="text-xs font-medium">{service.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400 ml-1">({service.numReviews})</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No reviews yet</span>
                  )}
                </div>
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {service.features && service.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {service.features.slice(0, 3).map((feature, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md flex items-center gap-1">
                        <CheckCircle size={10} /> {feature}
                      </span>
                    ))}
                    {service.features.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">+ {service.features.length - 3} more</span>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-6 pt-0 mt-auto">
                <Button
                  className="w-full bg-vaquah-blue hover:bg-vaquah-dark-blue transition-colors"
                  onClick={() => handleBookClick(service)}
                >
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/appointments/new">
            <Button variant="outline" className="border-vaquah-blue text-vaquah-blue hover:bg-vaquah-blue hover:text-white">
              View All Services
            </Button>
          </Link>
        </div>
      </div>

      <BookingDialog
        service={selectedService}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </section>
  );
};

export default ServiceSection;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Clock, CheckCircle, Star } from 'lucide-react';
import { marketingService } from '@/services/marketingService';
import BookingDialog from '@/components/BookingDialog';

const AppointmentNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Use marketingService to get filtered/processed services list
        const fetchedServices = await marketingService.getServices();
        setServices(fetchedServices);
      } catch (error) {
        console.error('Failed to fetch services:', error);
        toast({
          title: 'Error',
          description: 'Failed to load services. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [user]);

  const handleBookClick = (service) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to schedule an appointment',
        variant: 'destructive'
      });
      navigate('/login', { state: { from: '/appointments/new' } });
      return;
    }
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-vaquah-blue text-white py-16 animate-fade-in">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">Schedule a Service</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Choose from our range of professional services. Book online and get priority support.
          </p>
          <p className="mt-4 text-sm bg-white/10 inline-block px-4 py-2 rounded-full backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Need help? Contact us at <a href="mailto:contact@vaquah.in" className="underline hover:text-blue-200">contact@vaquah.in</a>
          </p>
        </div>
      </div>

      <div className="container-custom py-12 flex-1">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vaquah-blue mx-auto mb-4"></div>
            <p className="text-gray-500">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-center py-16">
              <div className="bg-blue-50 inline-block p-4 rounded-full mb-4">
                <Clock className="w-12 h-12 text-vaquah-blue" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We are currently updating our service offerings. Please check back later or contact support.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
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
        )}
      </div>

      <BookingDialog
        service={selectedService}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <Footer />
    </div>
  );
};

export default AppointmentNew;
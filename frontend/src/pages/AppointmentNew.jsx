import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { Calendar, Info, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { servicesService } from '@/services/firestoreService';

const AppointmentNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    description: '',
    priority: 'normal',
    contactPhone: '',
    alternatePhone: '',
    address: ''
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const fetchedServices = await servicesService.getAllServices();
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
  }, []);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const handlePhoneChange = (e, field) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);

    let formatted = value;
    if (value.length > 5) {
      formatted = `${value.slice(0, 5)} ${value.slice(5)}`;
    }

    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const getEstimatedCost = () => {
    if (!selectedService) return 0;
    const basePrice = Number(selectedService.price) || 0;
    return formData.priority === 'urgent' ? basePrice * 2 : basePrice;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!validatePhone(formData.contactPhone)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid 10-digit Indian phone number',
        variant: 'destructive'
      });
      setSubmitting(false);
      return;
    }

    const estCost = getEstimatedCost();
    const depositAmount = +(estCost * 0.20).toFixed(2);

    const appointmentItem = {
      _id: `appt_${Date.now()}`,
      name: `${selectedService.name} (${formData.priority}) - 20% Deposit`,
      type: 'appointment',
      price: depositAmount,
      image: selectedService.imageUrl || 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      serviceDetails: {
        service: selectedService.name,
        serviceId: selectedService.id,
        date: formData.date,
        time: formData.time,
        description: formData.description,
        priority: formData.priority,
        contactPhone: formData.contactPhone.replace(/\D/g, ''),
        alternatePhone: formData.alternatePhone.replace(/\D/g, ''),
        address: formData.address,
        estimatedCost: estCost,
        depositAmount: depositAmount
      }
    };

    addToCart(appointmentItem, 1);

    toast({
      title: 'Added to Cart',
      description: 'Appointment added to your cart. Please proceed to checkout.',
    });

    setIsDialogOpen(false);
    navigate('/cart');
    setSubmitting(false);
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];
  const getMaxDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
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
            <p className="text-gray-500">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {services.map((service) => (
              <Card key={service.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full overflow-hidden group">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={service.imageUrl || 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?w=500&auto=format&fit=crop&q=60'}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-vaquah-blue shadow-sm">
                    Starts ₹{service.price}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">{service.name}</CardTitle>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book {selectedService?.name}</DialogTitle>
            <DialogDescription>
              Complete the form below to schedule your appointment. A 20% deposit is required to confirm.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date *</Label>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time *</Label>
                <Select
                  name="time"
                  value={formData.time}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone *</Label>
                <Input
                  type="tel"
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handlePhoneChange(e, 'contactPhone')}
                  required
                  placeholder="99999 99999"
                  maxLength={11}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input
                  type="tel"
                  id="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={(e) => handlePhoneChange(e, 'alternatePhone')}
                  placeholder="Optional"
                  maxLength={11}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Service Address *</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Enter complete address"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Issue Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the issue or service needed"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                name="priority"
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal (Standard Rate)</SelectItem>
                  <SelectItem value="urgent">Urgent (2x Rate)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
              <Info className="text-blue-600 mt-1 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Estimated Total: ₹{getEstimatedCost().toFixed(2)}</p>
                <p>Deposit Required (20%): ₹{(getEstimatedCost() * 0.20).toFixed(2)}</p>
                <p className="text-xs mt-1 opacity-80">Remaining balance payable after service completion.</p>
              </div>
            </div>

            <Button type="submit" className="w-full bg-vaquah-blue hover:bg-vaquah-dark-blue" disabled={submitting}>
              {submitting ? 'Processing...' : `Pay Deposit & Book (₹${(getEstimatedCost() * 0.20).toFixed(2)})`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AppointmentNew;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';

const AppointmentNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceType: '',
    date: '',
    time: '',
    description: '',
    priority: 'normal',
    contactPhone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const serviceTypes = [
    'AC Repair',
    'AC Maintenance',
    'AC Installation',
    'AC Service',
    'Heating Repair',
    'Heating Maintenance',
    'Plumbing',
    'Electrical',
    'Emergency Service',
    'Other'
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  // Format phone number as user types (Indian format)
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
    
    // Format as Indian phone number
    let formatted = value;
    if (value.length > 5) {
      formatted = `${value.slice(0, 5)} ${value.slice(5)}`;
    } else if (value.length > 0) {
      formatted = value;
    }
    
    setFormData({
      ...formData,
      contactPhone: formatted
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Validate Indian phone number
  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to schedule an appointment',
        variant: 'destructive'
      });
      navigate('/login', { state: { from: '/appointments/new' } });
      return;
    }

    if (!validatePhone(formData.contactPhone)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid 10-digit Indian phone number',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { appointmentService } = await import('@/services/firestoreService');
      await appointmentService.createAppointment({
        userId: user.uid,
        service: formData.serviceType,
        date: formData.date,
        time: formData.time,
        description: formData.description,
        priority: formData.priority,
        contactPhone: formData.contactPhone.replace(/\D/g, ''), // Store as digits only
        address: formData.address,
        status: 'pending'
      });
      toast({
        title: 'Success',
        description: 'Appointment scheduled successfully!'
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule appointment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container-custom py-4 sm:py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold">Schedule New Appointment</h1>
            </div>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Book a service appointment with our team</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>Fill in the details to schedule your service appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                <div>
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select
                    name="serviceType"
                    value={formData.serviceType}
                    onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Preferred Date *</Label>
                    <Input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={getMinDate()}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Preferred Time *</Label>
                    <Select
                      name="time"
                      value={formData.time}
                      onValueChange={(value) => setFormData({ ...formData, time: value })}
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

                <div>
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handlePhoneChange}
                    required
                    placeholder="98765 43210"
                    maxLength={12}
                    pattern="[0-9\s]{10,12}"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter 10-digit Indian mobile number</p>
                </div>

                <div>
                  <Label htmlFor="address">Service Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    placeholder="Enter the complete address where service is needed"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Service Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Please describe the issue or service needed in detail"
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-vaquah-blue hover:bg-vaquah-dark-blue"
                  >
                    {loading ? 'Scheduling...' : 'Schedule Appointment'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AppointmentNew; 
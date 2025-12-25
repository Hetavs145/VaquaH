import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { Info } from 'lucide-react';

const BookingDialog = ({ service, open, onOpenChange }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        date: '',
        time: '',
        description: '',
        priority: 'normal',
        contactPhone: '',
        alternatePhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });

    useEffect(() => {
        if (user && open) {
            setFormData(prev => ({
                ...prev,
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ')[1] || '',
                email: user.email || ''
            }));
        }
    }, [user, open]);

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

    const getVisitingCharge = () => {
        return service?.visitingCharge ? Number(service.visitingCharge) : 100;
    };

    const getEstimatedCost = () => {
        if (!service) return 0;
        const basePrice = Number(service.price) || 0;
        return formData.priority === 'urgent' ? basePrice * 2 : basePrice;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: 'Authentication required',
                description: 'Please sign in to schedule an appointment',
                variant: 'destructive'
            });
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

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
        const visitingCharge = getVisitingCharge();

        const appointmentItem = {
            _id: `appt_${Date.now()}`,
            name: `${service.name} (${formData.priority}) - Visiting Charge`,
            type: 'appointment',
            price: visitingCharge,
            image: service.imageUrl || 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?w=500&auto=format&fit=crop&q=60',
            serviceDetails: {
                service: service.name,
                serviceId: service.id,
                date: formData.date,
                time: formData.time,
                description: formData.description,
                priority: formData.priority,
                fullName: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                contactPhone: formData.contactPhone.replace(/\D/g, ''),
                alternatePhone: formData.alternatePhone.replace(/\D/g, ''),
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                estimatedCost: estCost,
                visitingCharge: visitingCharge
            }
        };

        addToCart(appointmentItem, 1);

        toast({
            title: 'Added to Cart',
            description: 'Appointment added to your cart. Please proceed to checkout.',
        });

        onOpenChange(false);
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-full mx-4 sm:mx-auto">
                <DialogHeader>
                    <DialogTitle>Book {service?.name}</DialogTitle>
                    <DialogDescription>
                        Complete the form below to schedule your appointment. A visiting charge of ₹{getVisitingCharge()} is required to confirm.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
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
                            <p className="font-semibold">Estimated Total Service Cost: ₹{getEstimatedCost().toFixed(2)}</p>
                            <p className="font-bold mt-1 text-base">Visiting Charge (Payable Now): ₹{getVisitingCharge().toFixed(2)}</p>
                            <p className="text-xs mt-1 opacity-80">This charge confirms your booking.</p>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-vaquah-blue hover:bg-vaquah-dark-blue" disabled={submitting}>
                        {submitting ? 'Processing...' : `Add to Cart (₹${getVisitingCharge().toFixed(2)})`}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BookingDialog;

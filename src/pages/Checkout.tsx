
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import PaymentGateway from '@/components/PaymentGateway';
import { Check, CreditCard } from 'lucide-react';

// Mock cart items for demonstration
const sampleCartItems = [
  {
    id: '1',
    name: 'VaquaH Inverter Split AC 1.5 Ton',
    price: 499.99,
    quantity: 1,
  },
  {
    id: '2',
    name: 'Installation Kit',
    price: 49.99,
    quantity: 1,
  }
];

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Calculate totals
  const subtotal = sampleCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.09;
  const shipping = 25;
  const total = subtotal + tax + shipping;
  
  const handlePaymentSuccess = (transactionId: string) => {
    setShowPayment(false);
    setOrderComplete(true);
    console.log(`Payment successful with transaction ID: ${transactionId}`);
  };
  
  const handlePaymentCancel = () => {
    setShowPayment(false);
  };
  
  const proceedToPayment = () => {
    setShowPayment(true);
  };
  
  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="container-custom py-8">
          {orderComplete ? (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Check size={48} className="text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-4">Thank You for Your Order!</h1>
              <p className="mb-6 text-gray-600">
                Your order has been placed successfully. We've sent a confirmation email with all the details.
              </p>
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <p className="font-semibold">Order #VH-{Math.floor(Math.random() * 10000)}</p>
                <p className="text-gray-500">Expected delivery: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
              <Button onClick={handleContinueShopping} className="bg-vaquah-blue hover:bg-vaquah-dark-blue">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column - Order Summary */}
              <div className="md:col-span-2">
                {showPayment ? (
                  <PaymentGateway 
                    amount={total} 
                    onSuccess={handlePaymentSuccess} 
                    onCancel={handlePaymentCancel} 
                  />
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="john@example.com" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="+1 234 567 8901" />
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <Label htmlFor="address">Street Address</Label>
                        <Input id="address" placeholder="123 Main St" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input id="city" placeholder="New York" />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input id="state" placeholder="NY" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="zip">Zip Code</Label>
                          <Input id="zip" placeholder="10001" />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input id="country" placeholder="United States" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Any special instructions for delivery or installation"
                      />
                    </div>

                    <h2 className="text-xl font-bold mb-4 mt-8">Payment Method</h2>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mb-6">
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center cursor-pointer">
                          <CreditCard size={20} className="mr-2" />
                          Credit/Debit Card
                        </Label>
                      </div>
                    </RadioGroup>
                    
                    <Button 
                      onClick={proceedToPayment} 
                      className="w-full bg-vaquah-blue hover:bg-vaquah-dark-blue"
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Right Column - Order Summary */}
              <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    {sampleCartItems.map(item => (
                      <div key={item.id} className="flex justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <p className="text-gray-600">Subtotal</p>
                      <p>${subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Shipping</p>
                      <p>${shipping.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Tax</p>
                      <p>${tax.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <p>Total</p>
                      <p>${total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;

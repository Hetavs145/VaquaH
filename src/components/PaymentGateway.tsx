
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentGatewayProps {
  amount: number;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!cardName.trim()) {
      newErrors.cardName = 'Please enter the name on your card';
    }
    
    if (!expiry.trim() || !expiry.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiry = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!cvv.trim() || cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      
      // Generate a random transaction ID
      const transactionId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      toast({
        title: "Payment Successful",
        description: `Your payment of $${amount.toFixed(2)} was processed successfully.`,
      });
      
      onSuccess(transactionId);
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove any non-digit characters
    value = value.replace(/\D/g, '');
    
    // Insert a slash after the second digit
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    setExpiry(value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
        <p className="text-gray-600">Amount to pay: <span className="font-bold">${amount.toFixed(2)}</span></p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="card-number">Card Number</Label>
            <div className="relative">
              <Input 
                id="card-number" 
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={errors.cardNumber ? "border-red-500" : ""}
              />
              <CreditCard className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>
            {errors.cardNumber && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={12} className="mr-1" /> {errors.cardNumber}</p>}
          </div>
          
          <div>
            <Label htmlFor="card-name">Name on Card</Label>
            <Input 
              id="card-name" 
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Doe"
              className={errors.cardName ? "border-red-500" : ""}
            />
            {errors.cardName && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={12} className="mr-1" /> {errors.cardName}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <div className="relative">
                <Input 
                  id="expiry" 
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={errors.expiry ? "border-red-500" : ""}
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={16} />
              </div>
              {errors.expiry && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={12} className="mr-1" /> {errors.expiry}</p>}
            </div>
            
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input 
                id="cvv" 
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                maxLength={4}
                type="password"
                className={errors.cvv ? "border-red-500" : ""}
              />
              {errors.cvv && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={12} className="mr-1" /> {errors.cvv}</p>}
            </div>
          </div>
          
          <div className="pt-4 space-x-4 flex">
            <Button 
              type="submit" 
              className="bg-vaquah-blue hover:bg-vaquah-dark-blue flex-1" 
              disabled={processing}
            >
              {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>This is a demo payment gateway for testing.</p>
        <p>No actual payments will be processed.</p>
      </div>
    </div>
  );
};

export default PaymentGateway;

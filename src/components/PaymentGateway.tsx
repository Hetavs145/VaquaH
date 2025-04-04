
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface PaymentGatewayProps {
  amount: number;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to make a payment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast({
        title: "Payment failed",
        description: "Failed to load payment gateway",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Create a new order and get order ID from server
    // In a real implementation, this would be an API call to your backend
    const orderData = {
      amount: amount * 100, // Razorpay takes amount in paise
      currency: "INR",
      receipt: "order_" + Math.floor(Math.random() * 1000000)
    };
    
    // Mock order ID for demo purposes
    const orderId = "order_" + Math.floor(Math.random() * 1000000);

    const options = {
      key: "rzp_test_V8Yj1Nj0XlKI9N", // Enter your test key here
      amount: amount * 100,
      currency: "INR",
      name: "VaquaH",
      description: "AC Purchase",
      order_id: orderId,
      handler: function (response: any) {
        setLoading(false);
        // Handle successful payment
        onSuccess(response.razorpay_payment_id);
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone || ""
      },
      notes: {
        address: "VaquaH Corporate Office"
      },
      theme: {
        color: "#3399cc"
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          onCancel();
        }
      }
    };

    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast({
        title: "Payment failed",
        description: "Something went wrong with the payment gateway",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCreditCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    handlePayment();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
        <p className="text-gray-600">Amount to pay: <span className="font-bold">₹{amount.toFixed(2)}</span></p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <p className="text-sm text-blue-700">
            We use Razorpay for secure payment processing. Click the "Pay Now" button to proceed with payment.
          </p>
        </div>

        <Button 
          onClick={handlePayment} 
          className="w-full bg-vaquah-blue hover:bg-vaquah-dark-blue"
          disabled={loading}
        >
          {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)} with Razorpay`}
        </Button>

        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="w-full mt-2"
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>This is using Razorpay Test Mode.</p>
        <p>No actual payments will be processed.</p>
      </div>
    </div>
  );
};

export default PaymentGateway;

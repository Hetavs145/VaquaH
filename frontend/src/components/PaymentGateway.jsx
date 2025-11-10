import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PaymentGateway = ({ amount, onSuccess, onCancel, disabled = false, disabledReason = 'Please complete all required details before proceeding.' }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (disabled) {
      toast({
        title: 'Incomplete details',
        description: disabledReason,
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to make a payment",
        variant: "destructive",
      });
      // Redirect to login page, storing the return path
      navigate('/login', { state: { from: window.location.pathname } });
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

    // Create Razorpay order on the backend
    let orderId;
    try {
      const { orderService } = await import('@/services/orderService');
      const order = await orderService.createRazorpayOrder({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: 'order_' + Math.floor(Math.random() * 1000000),
      });
      orderId = order.id;
    } catch (e) {
      toast({
        title: 'Payment failed',
        description: 'Unable to create payment order',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: "INR",
      name: "VaquaH",
      description: "VaquaH Order Payment",
      order_id: orderId,
      handler: function (response) {
        (async () => {
          try {
            const { orderService } = await import('@/services/orderService');
            const verification = await orderService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setLoading(false);
            if (verification.valid === true) {
              onSuccess(response.razorpay_payment_id);
            } else {
              toast({
                title: 'Verification failed',
                description: verification.message || 'Payment could not be verified',
                variant: 'destructive',
              });
            }
          } catch (err) {
            setLoading(false);
            toast({
              title: 'Verification error',
              description: 'Unable to verify payment',
              variant: 'destructive',
            });
          }
        })();
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone || ""
      },
      notes: {
        address: "VaquaH Corporate Office, Mumbai"
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
        description: error?.message || "Something went wrong with the payment gateway",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
        <p className="text-gray-600">Amount to pay: <span className="font-bold">₹{amount.toFixed(2)}</span></p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <p className="text-sm text-blue-700 flex items-start">
            <AlertCircle size={16} className="mr-2 mt-0.5" />
            {user ? 
              "We use Razorpay for secure payment processing. Click the 'Pay Now' button to proceed with payment." : 
              "Please sign in to continue with payment."
            }
          </p>
        </div>

        <Button 
          onClick={handlePayment} 
          className="w-full bg-vaquah-blue hover:bg-vaquah-dark-blue"
          disabled={loading || disabled}
        >
          {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)} with Razorpay`}
        </Button>

        {disabled && (
          <div className="text-xs text-red-600 mt-1">{disabledReason}</div>
        )}

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

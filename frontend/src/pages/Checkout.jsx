import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaymentGateway from '@/components/PaymentGateway';
import { useAuth } from '@/context/AuthContext';

const Checkout = () => {
  const { state, clearCart } = useCart();
  const { cartItems } = state;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  const codAdvanceThreshold = 2000;
  const payableAmount = useMemo(() => {
    const total = calculateTotal();
    if (paymentMethod === 'cod' && total > codAdvanceThreshold) {
      return +(total * 0.25).toFixed(2);
    }
    return total;
  }, [paymentMethod, cartItems]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSuccess = async (paymentId) => {
    try {
      const { orderService } = await import('@/services/firestoreService');
      const total = calculateTotal();
      const isCOD = paymentMethod === 'cod';
      const isAdvanceRequired = isCOD && total > codAdvanceThreshold;
      const amountPaid = isCOD && isAdvanceRequired ? +(total * 0.25).toFixed(2) : total;

      const orderPayload = {
        userId: user?.uid || 'guest',
        items: cartItems.map(ci => ({ id: ci._id || ci.id, name: ci.name, price: ci.price, qty: ci.qty })),
        totalPrice: total,
        isPaid: !isCOD, // fully paid only for online full payments
        paymentId,
        status: isCOD ? (isAdvanceRequired ? 'advance_paid' : 'cod_pending') : 'paid',
        paymentMethod: isCOD ? 'COD' : 'Razorpay',
        advanceRequired: isAdvanceRequired,
        advanceAmount: isAdvanceRequired ? +(total * 0.25).toFixed(2) : 0,
        amountPaid,
      };
      await orderService.createOrder(orderPayload);
    } catch (e) {
      console.error('Failed to save order:', e);
    } finally {
      clearCart();
      navigate('/dashboard');
    }
  };

  const handlePlaceOrderCOD = async () => {
    try {
      const { orderService } = await import('@/services/firestoreService');
      const total = calculateTotal();
      const isAdvanceRequired = total > codAdvanceThreshold;
      const orderPayload = {
        userId: user?.uid || 'guest',
        items: cartItems.map(ci => ({ id: ci._id || ci.id, name: ci.name, price: ci.price, qty: ci.qty })),
        totalPrice: total,
        isPaid: false,
        paymentId: null,
        status: isAdvanceRequired ? 'awaiting_advance' : 'cod_pending',
        paymentMethod: 'COD',
        advanceRequired: isAdvanceRequired,
        advanceAmount: isAdvanceRequired ? +(total * 0.25).toFixed(2) : 0,
        amountPaid: 0,
      };
      await orderService.createOrder(orderPayload);
    } catch (e) {
      console.error('Failed to save COD order:', e);
    } finally {
      clearCart();
      navigate('/dashboard');
    }
  };

  const handlePaymentCancel = () => {
    // Optionally handle cancel flow
  };

  const shippingIncomplete = !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 font-sans leading-tight" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'}}>
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 text-lg">Add some products to checkout!</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 font-sans leading-tight" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'}}>
            Checkout
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="border rounded-lg p-4">
                {cartItems.map((item, idx) => (
                  <div key={`${item._id || idx}-checkout`} className="flex justify-between items-center py-2">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600 ml-2">x {item.qty}</span>
                    </div>
                    <span>₹{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <hr className="my-4" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                {paymentMethod === 'cod' && calculateTotal() > codAdvanceThreshold && (
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Advance Payable Now (25%):</span>
                    <span>₹{(calculateTotal() * 0.25).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Form */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>

                {/* Payment method selection with COD 25% advance */}
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-semibold">Payment Method</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod==='razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-vaquah-blue" />
                      <span>Razorpay (Recommended)</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod==='cod'} onChange={() => setPaymentMethod('cod')} className="accent-vaquah-blue" />
                      <span>Cash on Delivery (COD) - Advance 25% for orders above ₹2000</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  {paymentMethod === 'cod' && calculateTotal() <= codAdvanceThreshold ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        if (shippingIncomplete) {
                          return alert('Please fill all shipping details before proceeding.');
                        }
                        handlePlaceOrderCOD();
                      }}
                      className="w-full bg-vaquah-blue text-white py-2 px-4 rounded hover:bg-vaquah-dark-blue"
                      disabled={shippingIncomplete}
                    >
                      Place COD Order (Pay on Delivery)
                    </button>
                  ) : (
                    <PaymentGateway 
                      amount={payableAmount}
                      onSuccess={(pid) => { handlePaymentSuccess(pid); }}
                      onCancel={handlePaymentCancel}
                      disabled={shippingIncomplete}
                      disabledReason={'Please fill all shipping details before proceeding.'}
                    />
                  )}
                  {paymentMethod === 'cod' && calculateTotal() > codAdvanceThreshold && (
                    <p className="text-sm text-gray-600">You will be charged an advance of ₹{(calculateTotal()*0.25).toFixed(2)} now. Remaining amount payable on delivery.</p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout; 
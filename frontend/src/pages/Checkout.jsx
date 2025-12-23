import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaymentGateway from '@/components/PaymentGateway';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Checkout = () => {
  const { state, clearCart } = useCart();
  const { cartItems, discount } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Received from Cart page, default to standard if not present
  const initialShippingMethod = location.state?.shippingMethod || 'standard';
  const [shippingMethod, setShippingMethod] = useState(initialShippingMethod);

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

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  const calculateShipping = () => {
    if (shippingMethod === 'express') return 150;
    // Standard: Logic: Free above 999 on POST-DISCOUNT amount
    const sub = calculateSubtotal();
    const discountAmount = discount?.amount || 0;
    const totalAfterDiscount = Math.max(0, sub - discountAmount);
    return totalAfterDiscount > 999 ? 0 : 50;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = discount?.amount || 0;
    const shippingCost = calculateShipping();
    return Math.max(0, subtotal - discountAmount) + shippingCost;
  };

  // Helper for UI calculation of "Add X more"
  const getSubtotalAfterDiscount = () => {
    const sub = calculateSubtotal();
    const discountAmount = discount?.amount || 0;
    return Math.max(0, sub - discountAmount);
  };

  const codAdvanceThreshold = 2000;
  const payableAmount = useMemo(() => {
    const total = calculateTotal();
    if (paymentMethod === 'cod' && total > codAdvanceThreshold) {
      return +(total * 0.25).toFixed(2);
    }
    return total;
  }, [paymentMethod, cartItems, shippingMethod, discount]); // Added discount dependency

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createAppointmentFromItem = async (item, userId) => {
    try {
      const { appointmentService } = await import('@/services/firestoreService');
      await appointmentService.createAppointment({
        userId: userId,
        service: item.serviceDetails.service,
        date: item.serviceDetails.date,
        time: item.serviceDetails.time,
        description: item.serviceDetails.description,
        priority: item.serviceDetails.priority,
        contactPhone: item.serviceDetails.contactPhone,
        alternatePhone: item.serviceDetails.alternatePhone,
        address: item.serviceDetails.address,
        status: 'pending',
        paymentStatus: 'paid' // Or 'cod_pending'
      });
    } catch (error) {
      console.error('Error creating appointment from cart item:', error);
    }
  };

  const handlePaymentSuccess = async (paymentId) => {
    try {
      const { orderService } = await import('@/services/firestoreService');
      const total = calculateTotal();
      const shippingCost = calculateShipping();
      const isCOD = paymentMethod === 'cod';
      const isAdvanceRequired = isCOD && total > codAdvanceThreshold;
      const amountPaid = isCOD && isAdvanceRequired ? +(total * 0.25).toFixed(2) : total;

      // Create appointments for appointment items
      const appointmentItems = cartItems.filter(item => item.type === 'appointment');
      for (const item of appointmentItems) {
        await createAppointmentFromItem(item, user?.uid || 'guest');
      }

      const orderPayload = {
        userId: user?.uid || 'guest',
        items: cartItems.map(ci => ({
          id: ci._id || ci.id,
          name: ci.name,
          price: ci.price,
          qty: ci.qty,
          type: ci.type || 'product',
          image: ci.image // Added image
        })),
        shippingMethod,
        shippingCost,
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
      const shippingCost = calculateShipping();
      const isAdvanceRequired = total > codAdvanceThreshold;

      // Create appointments for appointment items
      const appointmentItems = cartItems.filter(item => item.type === 'appointment');
      for (const item of appointmentItems) {
        // For COD, we might want to mark paymentStatus as 'pending'
        const { appointmentService } = await import('@/services/firestoreService');
        await appointmentService.createAppointment({
          userId: user?.uid || 'guest',
          service: item.serviceDetails.service,
          date: item.serviceDetails.date,
          time: item.serviceDetails.time,
          description: item.serviceDetails.description,
          priority: item.serviceDetails.priority,
          contactPhone: item.serviceDetails.contactPhone,
          alternatePhone: item.serviceDetails.alternatePhone,
          address: item.serviceDetails.address,
          status: 'pending',
          paymentStatus: 'cod_pending'
        });
      }

      const orderPayload = {
        userId: user?.uid || 'guest',
        items: cartItems.map(ci => ({
          id: ci._id || ci.id,
          name: ci.name,
          price: ci.price,
          qty: ci.qty,
          type: ci.type || 'product',
          image: ci.image // Added image
        })),
        shippingMethod,
        shippingCost,
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
          <div className="text-center px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 font-sans leading-tight" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"' }}>
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">Add some products to checkout!</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 font-sans leading-tight" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"' }}>
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Order Summary */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h2>
              <div className="border rounded-lg p-3 sm:p-4">
                {cartItems.map((item, idx) => (
                  <div key={`${item._id || idx}-checkout`} className="flex justify-between items-center py-2">
                    <div className="flex items-center flex-1 min-w-0 mr-2">
                      <div className="w-12 h-12 mr-3 shrink-0 bg-white border rounded overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5" />
                      </div>
                      <div>
                        <span className="font-medium text-sm sm:text-base block">{item.name}</span>
                        <span className="text-gray-600 text-sm">x {item.qty}</span>
                      </div>
                    </div>
                    <span className="text-sm sm:text-base flex-shrink-0">₹{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}

                {/* Shipping Selection in Checkout too, since user might change mind */}
                <div className="mt-4 mb-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Shipping Method</label>
                  <Select value={shippingMethod} onValueChange={setShippingMethod}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select shipping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express Delivery (₹150)</SelectItem>
                    </SelectContent>
                  </Select>
                  {shippingMethod === 'standard' && getSubtotalAfterDiscount() <= 999 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Add ₹{(1000 - getSubtotalAfterDiscount()).toFixed(2)} more for free delivery
                    </p>
                  )}
                  {shippingMethod === 'standard' && getSubtotalAfterDiscount() > 999 && (
                    <p className="text-xs text-green-600 mt-1">
                      Free delivery applied!
                    </p>
                  )}
                </div>

                <hr className="my-4" />
                <div className="flex justify-between font-semibold text-base sm:text-lg">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Shipping:</span>
                  <span className={calculateShipping() === 0 ? "text-green-600 font-medium" : ""}>
                    {calculateShipping() === 0 ? "FREE" : `₹${calculateShipping().toFixed(2)}`}
                  </span>
                </div>
                {discount?.code && (
                  <div className="flex justify-between text-sm text-green-600 mt-1">
                    <span>Discount ({discount.code}):</span>
                    <span>-₹{discount.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>

                {paymentMethod === 'cod' && calculateTotal() > codAdvanceThreshold && (
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-1">
                    <span>Advance Payable Now (25%):</span>
                    <span>₹{(calculateTotal() * 0.25).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Form */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Shipping Details</h2>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2 text-sm sm:text-base"
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
                      className="w-full border rounded px-3 py-2 text-sm sm:text-base"
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
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
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
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
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
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2 text-sm sm:text-base"
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
                      className="w-full border rounded px-3 py-2 text-sm sm:text-base"
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
                      className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Payment method selection with COD 25% advance */}
                <div className="mt-6 space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold">Payment Method</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 text-sm sm:text-base">
                      <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-vaquah-blue" />
                      <span>Razorpay (Recommended)</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm sm:text-base">
                      <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-vaquah-blue" />
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
                      className="w-full bg-vaquah-blue text-white py-2 px-4 rounded hover:bg-vaquah-dark-blue text-sm sm:text-base"
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
                    <p className="text-xs sm:text-sm text-gray-600">You will be charged an advance of ₹{(calculateTotal() * 0.25).toFixed(2)} now. Remaining amount payable on delivery.</p>
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
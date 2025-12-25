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

  // Separate items
  const productItems = cartItems.filter(item => item.type !== 'appointment');
  const appointmentItems = cartItems.filter(item => item.type === 'appointment');
  const hasProducts = productItems.length > 0;
  const hasServices = appointmentItems.length > 0;

  // Auto-fill from appointment if available
  React.useEffect(() => {
    if (hasServices && appointmentItems.length > 0) {
      const appt = appointmentItems[0];
      const details = appt.serviceDetails || {};

      setFormData(prev => ({
        ...prev,
        firstName: details.fullName?.split(' ')[0] || user?.displayName?.split(' ')[0] || prev.firstName,
        lastName: details.fullName?.split(' ')[1] || user?.displayName?.split(' ')[1] || prev.lastName,
        email: details.email || user?.email || prev.email,
        phone: details.contactPhone || prev.phone,
        address: details.address || prev.address,
        city: details.city || prev.city,
        state: details.state || prev.state,
        zipCode: details.zipCode || prev.zipCode
      }));
    } else if (user) {
      // Just user basics if no service
      setFormData(prev => ({
        ...prev,
        firstName: user.displayName?.split(' ')[0] || prev.firstName,
        lastName: user.displayName?.split(' ')[1] || prev.lastName,
        email: user.email || prev.email
      }));
    }
  }, [hasServices, user]);

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const productSubtotal = productItems.reduce((total, item) => total + (item.price * item.qty), 0);
  const visitingChargesTotal = appointmentItems.reduce((total, item) => total + (item.price * item.qty), 0);

  const calculateShipping = () => {
    if (shippingMethod === 'express') return 150;
    // Standard: Free above 999 on POST-DISCOUNT PRODUCT amount
    if (!hasProducts) return 0; // No shipping for services only

    // Discount applies only to products
    const discountAmount = discount?.amount || 0;
    const actualDiscount = Math.min(discountAmount, productSubtotal);
    const productTotalAfterDiscount = Math.max(0, productSubtotal - actualDiscount);

    return productTotalAfterDiscount > 999 ? 0 : 50;
  };

  const calculateTotal = () => {
    const discountAmount = discount?.amount || 0;
    const actualDiscount = Math.min(discountAmount, productSubtotal);
    const shippingCost = calculateShipping();

    // Total = (Product - Discount) + Visiting + Shipping
    return Math.max(0, productSubtotal - actualDiscount) + visitingChargesTotal + shippingCost;
  };

  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const payableAmount = useMemo(() => {
    const total = calculateTotal();

    if (paymentMethod === 'cod') {
      // Logic: 100% of Visiting Charge + 25% of (Product Total + Shipping)
      const discountAmount = discount?.amount || 0;
      const actualDiscount = Math.min(discountAmount, productSubtotal);
      const shippingCost = calculateShipping();
      const productSideTotal = Math.max(0, productSubtotal - actualDiscount) + shippingCost;

      const advance = Math.round((productSideTotal * 0.25) + visitingChargesTotal);
      return advance;
    }

    return total;
  }, [paymentMethod, cartItems, shippingMethod, discount]);

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
        serviceId: item.serviceDetails.serviceId,
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

      // Calculate split for tracking
      const discountAmount = discount?.amount || 0;
      const actualDiscount = Math.min(discountAmount, productSubtotal);
      const productSideTotal = Math.max(0, productSubtotal - actualDiscount) + shippingCost;

      const isCOD = paymentMethod === 'cod';
      const isAdvanceRequired = isCOD;
      const amountPaid = isCOD ? payableAmount : total;

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
        status: isCOD ? 'advance_paid' : 'paid',
        paymentMethod: isCOD ? 'COD' : 'Razorpay',
        advanceRequired: isAdvanceRequired,
        advanceAmount: isCOD ? amountPaid : 0,
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

  const handlePaymentCancel = () => {
    // Optionally handle cancel flow
  };

  const validatePhone = (phone) => {
    return phone && phone.replace(/\D/g, '').length === 10;
  };

  const isFormValid = () => {
    // If only services, we rely on the data we already have (or pre-filled).
    if (!hasProducts && hasServices) return true;

    // Otherwise (Products only or Mixed), we need full details
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      validatePhone(formData.phone) &&
      formData.address &&
      formData.city &&
      formData.state &&
      formData.zipCode
    );
  };

  const shippingIncomplete = !isFormValid();

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
                  {shippingMethod === 'standard' && productSubtotal <= 999 && hasProducts && (
                    <p className="text-xs text-blue-600 mt-1">
                      Add ₹{(1000 - productSubtotal).toFixed(2)} more for free delivery
                    </p>
                  )}
                  {shippingMethod === 'standard' && productSubtotal > 999 && (
                    <p className="text-xs text-green-600 mt-1">
                      Free delivery applied!
                    </p>
                  )}
                </div>

                <hr className="my-4" />
                <div className="flex justify-between font-semibold text-base sm:text-lg">
                  <span>Product Subtotal:</span>
                  <span>₹{productSubtotal.toFixed(2)}</span>
                </div>
                {hasServices && (
                  <div className="flex justify-between font-semibold text-base sm:text-lg text-blue-800">
                    <span>Visiting Charges:</span>
                    <span>₹{visitingChargesTotal.toFixed(2)}</span>
                  </div>
                )}
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

                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-1 bg-yellow-50 p-2 rounded">
                    <span>Advance Payable Now:</span>
                    <span className="font-bold">₹{payableAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Form or Pre-filled Info */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                {(!hasProducts && hasServices) ? "Contact Details" : "Shipping Details"}
              </h2>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {(!hasProducts && hasServices) ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <p className="text-sm text-blue-800 mb-4">
                      Your contact details have been captured from your appointment booking.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <div><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</div>
                      <div><span className="font-medium">Phone:</span> {formData.phone}</div>
                      <div className="col-span-2"><span className="font-medium">Email:</span> {formData.email}</div>
                      <div className="col-span-2"><span className="font-medium">Address:</span> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}</div>
                    </div>
                  </div>
                ) : (
                  <>
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
                        onChange={handlePhoneChange}
                        required
                        placeholder="Enter your 10 digit mobile number (+91)"
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
                  </>
                )}

                {/* Payment method selection with COD 25% advance */}
                <div className="mt-6 space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold">Payment Method</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 text-sm sm:text-base">
                      <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-vaquah-blue" />
                      <span>Razorpay (Recommended)</span>
                    </label>
                    <label className={`flex items-start gap-3 text-sm sm:text-base ${!hasProducts ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => {
                          if (!hasProducts) return;
                          setPaymentMethod('cod');
                        }}
                        className="accent-vaquah-blue mt-1"
                        disabled={!hasProducts}
                      />
                      <div className="flex flex-col">
                        <span>Cash on Delivery (COD)</span>
                        {!hasProducts ? (
                          <span className="text-xs text-red-500">Not available for service-only orders. Please pay visiting charge online.</span>
                        ) : (
                          <span className="text-xs text-gray-500">Requires advance payment of visiting charges + 25% of product value.</span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  {paymentMethod === 'cod' ? (
                    <PaymentGateway
                      amount={payableAmount}
                      onSuccess={(pid) => { handlePaymentSuccess(pid); }}
                      onCancel={handlePaymentCancel}
                      disabled={shippingIncomplete}
                      disabledReason={'Please fill all shipping details before proceeding.'}
                    />
                  ) : (
                    <PaymentGateway
                      amount={payableAmount}
                      onSuccess={(pid) => { handlePaymentSuccess(pid); }}
                      onCancel={handlePaymentCancel}
                      disabled={shippingIncomplete}
                      disabledReason={'Please fill all shipping details before proceeding.'}
                    />
                  )}

                  {/* Explainer */}
                  {paymentMethod === 'cod' && (
                    <p className="text-xs sm:text-sm text-gray-600">
                      You are paying an advance of <b>₹{payableAmount.toFixed(2)}</b> now.
                      The remaining balance (₹{(calculateTotal() - payableAmount).toFixed(2)}) will be payable on delivery.
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div >
  );
};

export default Checkout;
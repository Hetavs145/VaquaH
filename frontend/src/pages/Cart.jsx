import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tag, X, Heart, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

const Cart = () => {
  const { state, removeFromCart, updateQuantity, applyDiscount, removeDiscount } = useCart();
  const { cartItems, discount, wishlist } = state;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [availableOffers, setAvailableOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoadingOffers(true);
    try {
      const q = query(
        collection(db, 'offers'),
        where('active', '==', true),
        where('isHidden', '==', false),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setAvailableOffers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Failed to load offers', error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const [shippingMethod, setShippingMethod] = useState('standard');

  // Separate items by type
  const productItems = cartItems.filter(item => item.type !== 'appointment');
  const appointmentItems = cartItems.filter(item => item.type === 'appointment');

  const productSubtotal = productItems.reduce((total, item) => total + (item.price * item.qty), 0);
  const visitingChargesTotal = appointmentItems.reduce((total, item) => total + (item.price * item.qty), 0);

  // Discount applies only to products
  const discountAmount = discount?.amount || 0;
  // Ensure discount doesn't exceed product subtotal
  const actualDiscount = Math.min(discountAmount, productSubtotal);

  const productTotalAfterDiscount = Math.max(0, productSubtotal - actualDiscount);

  const calculateShipping = () => {
    if (shippingMethod === 'express') return 150;
    // Standard: Free above 999 on the POST-DISCOUNT PRODUCT amount
    // If no products, shipping logic might depend on business rule. Assuming standard logic applies to physical goods.
    if (productItems.length === 0) return 0;
    return productTotalAfterDiscount > 999 ? 0 : 50;
  };

  const shippingCost = calculateShipping();

  // Total = (Products - Discount) + Visiting Charges + Shipping
  const total = productTotalAfterDiscount + visitingChargesTotal + shippingCost;

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code) return;

    try {
      // Validate via backend API to handle hidden codes and MOV securely
      const response = await fetch('http://localhost:5001/api/offers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount: productSubtotal })
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to apply coupon",
          variant: "destructive"
        });
        return;
      }

      const offer = data;
      const discountVal = (productSubtotal * offer.discountPercent) / 100;

      applyDiscount({
        code: offer.code,
        amount: discountVal,
        percent: offer.discountPercent
      });

      toast({
        title: "Success",
        description: `Coupon ${offer.code} applied! Saved ₹${discountVal.toFixed(2)}`,
      });
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveCoupon = () => {
    removeDiscount();
    toast({
      title: "Removed",
      description: "Coupon removed successfully",
    });
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { shippingMethod } });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 font-sans leading-tight">Your Cart is Empty</h1>
            <p className="text-gray-600 text-base sm:text-lg">Add some products to get started!</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow p-4 sm:p-6 container mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 font-sans leading-tight">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={item._id || `cart-item-${index}`} className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
                <Link to={item.type === 'appointment' ? `/services/${item.serviceDetails?.serviceId}` : `/products/${item._id}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-contain bg-white p-1 rounded hover:opacity-90 transition-opacity"
                  />
                </Link>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">₹{item.price}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <label className="text-sm">Qty:</label>
                    <Select
                      value={item.qty.toString()}
                      onValueChange={(val) => updateQuantity(item._id, parseInt(val))}
                    >
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue placeholder={item.qty} />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Shipping Selection */}
              <div className="mb-6 space-y-2">
                <label className="text-sm font-medium text-gray-700">Shipping Method</label>
                <Select value={shippingMethod} onValueChange={setShippingMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shipping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="express">Express Delivery (₹150)</SelectItem>
                  </SelectContent>
                </Select>
                {shippingMethod === 'standard' && productTotalAfterDiscount <= 999 && productItems.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Add ₹{(1000 - productTotalAfterDiscount).toFixed(2)} more for free delivery
                  </p>
                )}
                {shippingMethod === 'standard' && productTotalAfterDiscount > 999 && (
                  <p className="text-xs text-green-600 mt-1">
                    Free delivery applied!
                  </p>
                )}
              </div>

              {/* Offers Section */}
              <div className="mb-6 space-y-3">
                <label className="text-sm font-medium text-gray-700">Apply Coupon</label>

                {/* Dropdown for public offers */}
                <Select onValueChange={handleApplyCoupon} disabled={!!discount.code}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an offer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOffers.map(offer => {
                      const isEligible = productSubtotal >= (offer.minOrderValue || 0);
                      return (
                        <SelectItem
                          key={offer.id}
                          value={offer.code}
                          disabled={!isEligible}
                          className={!isEligible ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{offer.code} - {offer.discountPercent}% OFF</span>
                            {offer.minOrderValue > 0 && (
                              <span className="text-xs text-gray-500">Min Order: ₹{offer.minOrderValue}</span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Manual Input for hidden codes */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter hidden code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!discount.code}
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleApplyCoupon(couponCode)}
                    disabled={!!discount.code || !couponCode}
                  >
                    Apply
                  </Button>
                </div>

                {/* Applied Discount Display */}
                {discount.code && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 flex justify-between items-center text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>Code <b>{discount.code}</b> applied</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-green-700 hover:text-green-900">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Subtotal</span>
                  <span>₹{productSubtotal.toFixed(2)}</span>
                </div>

                {visitingChargesTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visiting Charges</span>
                    <span>₹{visitingChargesTotal.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping ({shippingMethod === 'standard' ? 'Standard' : 'Express'})</span>
                  <span className={shippingCost === 0 ? "text-green-600" : ""}>
                    {shippingCost === 0 ? "FREE" : `₹${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {discount.code && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount.percent}%)</span>
                    <span>-₹{actualDiscount.toFixed(2)}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full mt-6 bg-vaquah-blue hover:bg-blue-700"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>

        {/* Wishlist Section */}
        {wishlist.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Heart className="text-vaquah-orange fill-vaquah-orange" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Your Wishlist</h2>
              </div>
              {wishlist.length > 5 && (
                <Button variant="ghost" className="text-vaquah-blue hover:text-vaquah-dark-blue" onClick={() => navigate('/wishlist')}>
                  Show More <ArrowRight size={16} className="ml-1" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {wishlist.slice(0, 5).map((product) => (
                <div key={product._id} className="transform scale-90 origin-top-left sm:scale-100 sm:origin-center">
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div >
  );
};

export default Cart;
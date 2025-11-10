import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Cart = () => {
  const { state, removeFromCart, updateQuantity } = useCart();
  const { cartItems } = state;
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 font-sans leading-tight" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'}}>
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">Add some products to get started!</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 font-sans leading-tight" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'}}>
            Shopping Cart
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2">
              {cartItems.map((item, index) => (
                <div key={item._id || `cart-item-${index}`} className="border rounded-lg p-3 sm:p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded self-center sm:self-start"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-semibold text-sm sm:text-base">{item.name}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">₹{item.price}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 justify-center sm:justify-start">
                      <label className="text-sm">Quantity:</label>
                      <select 
                        value={item.qty} 
                        onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:text-red-700 text-sm sm:text-base self-center sm:self-start"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-1">
              <div className="border rounded-lg p-4 sm:p-6 sticky top-4">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                {cartItems.map((item, idx) => (
                  <div key={`${item._id || `summary-${idx}`}`} className="flex justify-between text-sm sm:text-base">
                      <span className="truncate mr-2">{item.name} x {item.qty}</span>
                      <span className="flex-shrink-0">₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                ))}
                </div>
                <hr className="my-4" />
                <div className="flex justify-between font-semibold text-base sm:text-lg">
                  <span>Total:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded mt-4 hover:bg-blue-700 text-sm sm:text-base"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart; 
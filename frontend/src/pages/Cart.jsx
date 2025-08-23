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
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 font-sans leading-tight" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'}}>
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 text-lg">Add some products to get started!</p>
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
            Shopping Cart
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {cartItems.map((item, index) => (
                <div key={item._id || `cart-item-${index}`} className="border rounded-lg p-4 mb-4 flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">₹{item.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <label>Quantity:</label>
                      <select 
                        value={item.qty} 
                        onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                        className="border rounded px-2 py-1"
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-1">
              <div className="border rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                {cartItems.map((item, idx) => (
                  <div key={`${item._id || `summary-${idx}`}`} className="flex justify-between">
                      <span>{item.name} x {item.qty}</span>
                      <span>₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                ))}
                </div>
                <hr className="my-4" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded mt-4 hover:bg-blue-700"
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
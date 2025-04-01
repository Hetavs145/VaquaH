
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

const Cart = () => {
  const { state, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  
  // Calculate totals
  const subtotal = state.cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.09;
  const shipping = subtotal > 0 ? 25 : 0;
  const total = subtotal + tax + shipping;
  
  const handleQuantityChange = (id: string, change: number, currentQty: number) => {
    const newQty = Math.max(1, currentQty + change);
    updateQuantity(id, newQty);
  };
  
  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
          
          {state.cartItems.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Button 
                onClick={handleContinueShopping} 
                className="bg-vaquah-blue hover:bg-vaquah-dark-blue"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="py-4 px-6 text-left">Product</th>
                        <th className="py-4 px-6 text-center">Quantity</th>
                        <th className="py-4 px-6 text-right">Price</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.cartItems.map((item) => (
                        <tr key={item._id} className="border-b">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-16 h-16 flex-shrink-0 mr-4 bg-gray-100 rounded-md overflow-hidden">
                                {item.images && item.images.length > 0 ? (
                                  <img 
                                    src={item.images[0]} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-gray-500">{item.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center">
                              <button 
                                onClick={() => handleQuantityChange(item._id, -1, item.qty)}
                                className="p-1 rounded-full hover:bg-gray-100"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="mx-2 w-8 text-center">{item.qty}</span>
                              <button 
                                onClick={() => handleQuantityChange(item._id, 1, item.qty)}
                                className="p-1 rounded-full hover:bg-gray-100"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            ${(item.price * item.qty).toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => handleRemoveItem(item._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handleContinueShopping}
                  >
                    Continue Shopping
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={clearCart}
                    className="text-red-500 border-red-500 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <p className="text-gray-600">Subtotal</p>
                      <p>${subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Shipping</p>
                      <p>${shipping.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Tax (9%)</p>
                      <p>${tax.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <p>Total</p>
                      <p>${total.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCheckout}
                    className="w-full bg-vaquah-blue hover:bg-vaquah-dark-blue"
                    disabled={state.cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
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

export default Cart;

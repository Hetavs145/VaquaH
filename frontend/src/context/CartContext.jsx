import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
  cartItems: localStorage.getItem('cartItems')
    ? JSON.parse(localStorage.getItem('cartItems') || '[]')
    : [],
  shippingAddress: localStorage.getItem('shippingAddress')
    ? JSON.parse(localStorage.getItem('shippingAddress') || 'null')
    : null,
  paymentMethod: localStorage.getItem('paymentMethod') || null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existItem = state.cartItems.find(
        (item) => item._id === action.payload._id
      );

      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item._id === existItem._id ? action.payload : item
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload],
        };
      }
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter((item) => item._id !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item._id === action.payload.id
            ? { ...item, qty: action.payload.qty }
            : item
        ),
      };
    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: action.payload,
      };
    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethod: action.payload,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: [],
      };
    default:
      return state;
  }
};

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persist cart items to local storage whenever they change
  React.useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  // Persist shipping address whenever it changes
  React.useEffect(() => {
    if (state.shippingAddress) {
      localStorage.setItem('shippingAddress', JSON.stringify(state.shippingAddress));
    }
  }, [state.shippingAddress]);

  // Persist payment method whenever it changes
  React.useEffect(() => {
    if (state.paymentMethod) {
      localStorage.setItem('paymentMethod', state.paymentMethod);
    }
  }, [state.paymentMethod]);

  const addToCart = (product, qty) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...product, qty },
    });
  };

  const removeFromCart = (id) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: id,
    });
  };

  const updateQuantity = (id, qty) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, qty },
    });
  };

  const saveShippingAddress = (data) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: data,
    });
  };

  const savePaymentMethod = (method) => {
    dispatch({
      type: 'SAVE_PAYMENT_METHOD',
      payload: method,
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        saveShippingAddress,
        savePaymentMethod,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

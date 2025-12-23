import api from './api';
import { orderService as firestoreOrderService } from './firestoreService';

export const orderService = {
  createOrder: async (orderData) => {
    return await firestoreOrderService.createOrder(orderData);
  },

  getOrderById: async (id) => {
    return await firestoreOrderService.getOrderById(id);
  },

  payOrder: async (id, paymentResult) => {
    return await firestoreOrderService.updateOrder(id, {
      isPaid: true,
      paidAt: new Date().toISOString(),
      paymentResult
    });
  },

  createRazorpayOrder: async ({ amount, currency = 'INR', receipt }) => {
    const { data } = await api.post('/payments/razorpay/create-order', { amount, currency, receipt });
    return data;
  },

  verifyRazorpayPayment: async (payload) => {
    const { data } = await api.post('/payments/razorpay/verify', payload);
    return data;
  },
};

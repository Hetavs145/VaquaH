
import api from './api';

export interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
}

export const orderService = {
  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  payOrder: async (id: string, paymentResult: any): Promise<Order> => {
    const { data } = await api.put(`/orders/${id}/pay`, paymentResult);
    return data;
  },
};

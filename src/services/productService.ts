
import api from './api';

export interface Product {
  _id: string;
  name: string;
  image: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  countInStock: number;
  rating: number;
  numReviews: number;
}

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const { data } = await api.get('/products');
    return data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const { data } = await api.post('/products', productData);
    return data;
  },
};

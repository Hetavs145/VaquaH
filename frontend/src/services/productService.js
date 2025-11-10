import api from './api';

export const productService = {
  getProducts: async () => {
    const { data } = await api.get('/products');
    return data;
  },

  getProductById: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  createProduct: async (productData) => {
    const { data } = await api.post('/products', productData);
    return data;
  },
};

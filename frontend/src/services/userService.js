import api from './api';

export const userService = {
  login: async (credentials) => {
    try {
      const { data } = await api.post('/users/login', credentials);
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const { data } = await api.post('/users', userData);
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
  },

  getCurrentUser: () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  updateProfile: async (userData) => {
    try {
      const { data } = await api.put('/users/profile', userData);
      const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  // Updated Google authentication method
  googleAuthenticate: async (credential) => {
    try {
      const { data } = await api.post('/users/google', { credential });
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  }
};

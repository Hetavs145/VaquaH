
import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

export const userService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const { data } = await api.post('/users/login', credentials);
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  },

  register: async (userData: RegisterData): Promise<User> => {
    const { data } = await api.post('/users/register', userData);
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  },

  logout: (): void => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
  },

  getCurrentUser: (): User | null => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const { data } = await api.put('/users/profile', userData);
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const updatedUser = { ...currentUser, ...data };
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    return updatedUser;
  },

  // Real Google authentication
  googleAuthenticate: async (credential: string): Promise<User> => {
    const { data } = await api.post('/users/google', { credential });
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  }
};

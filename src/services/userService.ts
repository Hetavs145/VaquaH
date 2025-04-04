
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
    localStorage.setItem('userInfo', JSON.stringify({
      ...JSON.parse(localStorage.getItem('userInfo') || '{}'),
      ...data,
    }));
    return data;
  },

  // Mock Google authentication
  googleAuthenticate: async (credential: string): Promise<User> => {
    // In a real application, you'd send the credential to your backend
    // For now, we'll create a mock user
    const mockUser = {
      _id: 'google-user-' + Math.random().toString(36).substring(2, 11),
      name: 'Google User',
      email: 'user@gmail.com',
      isAdmin: false,
      token: 'google-auth-token-' + Math.random().toString(36).substring(2, 15)
    };
    
    localStorage.setItem('userToken', mockUser.token);
    localStorage.setItem('userInfo', JSON.stringify(mockUser));
    
    return mockUser;
  }
};

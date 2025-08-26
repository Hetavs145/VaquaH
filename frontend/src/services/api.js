import axios from 'axios';

const API_URL = import.meta?.env?.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.host)
    ? 'http://localhost:5001/api'
    : '/api'
);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

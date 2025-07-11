import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Get base URL from environment variables
const getBaseURL = (): string => {
  const env = import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || 'development';
  
  switch (env) {
    case 'production':
      return import.meta.env.VITE_API_BASE_URL_PROD || 'https://api.rentalease.com';
    case 'development':
    default:
      return import.meta.env.VITE_API_BASE_URL_DEV || 'http://localhost:4000/api';
  }
};

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add authorization header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage or wherever you store it
    const token = localStorage.getItem('authToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error('Access denied: Insufficient permissions');
    }
    
    if (error.response?.status >= 500) {
      // Server error
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

export default api; 
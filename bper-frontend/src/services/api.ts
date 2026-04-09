import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '', // Uses Vite proxy /api → backend:3001
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Globally handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please log in again.');
      // A small delay before reloading/redirecting is good UX to show the toast
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return Promise.reject(error);
    }
    
    const message = error.response?.data?.message || 'An unexpected error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

export default api;

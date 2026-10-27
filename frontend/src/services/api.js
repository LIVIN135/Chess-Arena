import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chess_arena_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor with 401 cleanup
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        useAuthStore.getState().logout();
      } catch {
        localStorage.removeItem('chess_arena_token');
        localStorage.removeItem('chess_arena_user');
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('session-expired', {
          detail: { message: 'Your session has expired. Please log in again.' }
        }));
      }
    }
    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default api;

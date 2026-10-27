import { create } from 'zustand';
import { authService } from '../services/authService';
import { wsService } from '../services/websocketService';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('chess_arena_token'),
  isAuthenticated: !!localStorage.getItem('chess_arena_token'),
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      wsService.disconnect();
      const data = await authService.login(payload);
      localStorage.setItem('chess_arena_token', data.token);
      localStorage.setItem('chess_arena_user', JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (err) {
      const message = err.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      wsService.disconnect();
      const data = await authService.register(payload);
      localStorage.setItem('chess_arena_token', data.token);
      localStorage.setItem('chess_arena_user', JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (err) {
      const message = err.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    wsService.disconnect();
    localStorage.removeItem('chess_arena_token');
    localStorage.removeItem('chess_arena_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  initialize: async () => {
    const token = localStorage.getItem('chess_arena_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    const cachedUser = localStorage.getItem('chess_arena_user');
    if (cachedUser) {
      try {
        set({ user: JSON.parse(cachedUser), isAuthenticated: true });
      } catch {
        // invalid cached JSON
      }
    }

    try {
      const profile = await authService.getMe();
      localStorage.setItem('chess_arena_user', JSON.stringify(profile));
      set({ user: profile, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },
}));

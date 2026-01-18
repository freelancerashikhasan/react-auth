import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (userData, token) => {
        localStorage.setItem('token', token);
        set({ 
          user: userData, 
          token, 
          isAuthenticated: true 
        });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
      
      setUser: (userData) => set({ user: userData }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/lib/services/auth-service';
import { User, LoginCredentials } from '@/types/auth';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true });
          
          const response = await authService.login(credentials);
          
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Store token in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', response.access_token);
          }
          
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Lỗi khi đăng xuất:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token: string) => {
        set({ token });
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
        }
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      },

      initializeAuth: () => {
        // Lắng nghe event token expired từ API client
        if (typeof window !== 'undefined') {
          const handleTokenExpired = () => {
            console.log('Token expired, clearing auth...');
            get().clearAuth();
            // Redirect về login page
            window.location.href = '/login';
          };

          window.addEventListener('auth:token-expired', handleTokenExpired);

          // Cleanup function
          return () => {
            window.removeEventListener('auth:token-expired', handleTokenExpired);
          };
        }
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
); 
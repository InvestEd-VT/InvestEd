import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

// Keys used to store auth data in localStorage
export const AUTH_STORAGE_KEYS = {
  STORE: 'auth-storage',
} as const;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (isLoading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // The logged-in user's profile.
      user: null,
      // JWT sent in the Authorization header with API request.
      accessToken: null,
      // Token used to get a new accessToken when it expires.
      refreshToken: null,
      // Flag so components can check isAuthenticated instead of user !== null.
      isAuthenticated: false,
      isLoading: false,

      // Updates the user and keeps isAuthenticated in sync.
      setUser: (user) => set({ user, isAuthenticated: user !== null }),

      // Updates both tokens after a token refresh.
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      // toggles loading
      setLoading: (isLoading) => set({ isLoading }),

      // After a successful login, sets user, tokens, and marks as authenticated.
      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      // Clears all auth state on logout.
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: AUTH_STORAGE_KEYS.STORE,
      // Only persist tokens and user — isLoading is transient UI state
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

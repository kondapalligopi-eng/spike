import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  // False until the persisted state has been read from localStorage. Because
  // the site is pre-rendered logged-out (no localStorage on the server), we
  // defer reading it (skipHydration) so the first client render matches the
  // server — then rehydrate in an effect. Guards against SSG hydration errors.
  hasHydrated: boolean;
  login: (token: string, user: User, refreshToken?: string | null) => void;
  setTokens: (accessToken: string, refreshToken?: string | null) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      login: (token: string, user: User, refreshToken?: string | null) => {
        localStorage.setItem('auth_token', token);
        if (refreshToken) {
          localStorage.setItem('auth_refresh_token', refreshToken);
        } else {
          localStorage.removeItem('auth_refresh_token');
        }
        set({ token, refreshToken: refreshToken ?? null, user, isAuthenticated: true });
      },

      setTokens: (accessToken: string, refreshToken?: string | null) => {
        localStorage.setItem('auth_token', accessToken);
        if (refreshToken !== undefined) {
          if (refreshToken) localStorage.setItem('auth_refresh_token', refreshToken);
          else localStorage.removeItem('auth_refresh_token');
        }
        set((state) => ({
          token: accessToken,
          refreshToken: refreshToken !== undefined ? refreshToken ?? null : state.refreshToken,
        }));
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_user');
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      // Don't read localStorage during the first render — RootShell calls
      // rehydrate() in an effect so server & client initial HTML match.
      skipHydration: true,
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync tokens to localStorage for axios interceptor on a fresh tab.
        if (state?.token) localStorage.setItem('auth_token', state.token);
        if (state?.refreshToken) localStorage.setItem('auth_refresh_token', state.refreshToken);
        // Mark hydration complete so ProtectedRoute stops waiting.
        useAuthStore.setState({ hasHydrated: true });
      },
    }
  )
);

import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import type { UserResponse } from '@/types/user';

interface JwtPayload {
  sub: string;
  type: string;
  exp: number;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserResponse) => void;
  clearAuth: () => void;
  loadFromStorage: () => boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  userId: null,
  user: null,
  isAuthenticated: false,

  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    try {
      const decoded = jwtDecode<JwtPayload>(access);
      set({
        accessToken: access,
        refreshToken: refresh,
        userId: decoded.sub,
        isAuthenticated: true,
      });
    } catch {
      set({
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: true,
      });
    }
  },

  setUser: (user: UserResponse) => {
    set({ user });
  },

  clearAuth: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({
      accessToken: null,
      refreshToken: null,
      userId: null,
      user: null,
      isAuthenticated: false,
    });
  },

  loadFromStorage: () => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (access && refresh) {
      try {
        const decoded = jwtDecode<JwtPayload>(access);
        const now = Date.now() / 1000;
        if (decoded.exp > now) {
          set({
            accessToken: access,
            refreshToken: refresh,
            userId: decoded.sub,
            isAuthenticated: true,
          });
          return true;
        }
        // Access expired but refresh might work
        set({
          accessToken: access,
          refreshToken: refresh,
          userId: decoded.sub,
          isAuthenticated: true,
        });
        return true;
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return false;
      }
    }
    return false;
  },
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CustomCookie, SessionCookie } from './api-tester-types.ts';

// ========== Cookie Utility Functions ==========

// Check if a cookie is expired based on its expires field
export function isCookieExpired(cookie: SessionCookie): boolean {
  if (!cookie.expires) return false;
  const expiresDate = new Date(cookie.expires);
  return expiresDate.getTime() < Date.now();
}

// Check if a cookie will expire soon (within specified minutes, default 5 minutes)
export function isCookieExpiringSoon(cookie: SessionCookie, withinMinutes = 5): boolean {
  if (!cookie.expires) return false;
  const expiresDate = new Date(cookie.expires);
  const warningThreshold = Date.now() + withinMinutes * 60 * 1000;
  return expiresDate.getTime() < warningThreshold && expiresDate.getTime() > Date.now();
}

// Get time until cookie expires in a human-readable format
export function getCookieExpirationInfo(cookie: SessionCookie): {
  isExpired: boolean;
  isExpiringSoon: boolean;
  expiresIn: string | null;
} {
  if (!cookie.expires) {
    return { isExpired: false, isExpiringSoon: false, expiresIn: null };
  }

  const expiresDate = new Date(cookie.expires);
  const now = Date.now();
  const diff = expiresDate.getTime() - now;

  if (diff <= 0) {
    return { isExpired: true, isExpiringSoon: false, expiresIn: 'Expired' };
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  let expiresIn: string;
  if (days > 0) {
    expiresIn = `${days}d`;
  } else if (hours > 0) {
    expiresIn = `${hours}h`;
  } else {
    expiresIn = `${minutes}m`;
  }

  return {
    isExpired: false,
    isExpiringSoon: minutes < 5,
    expiresIn,
  };
}

// Filter out expired cookies from an array
function filterExpiredCookies(cookies: SessionCookie[]): SessionCookie[] {
  return cookies.filter((cookie) => !isCookieExpired(cookie));
}

// ========== Cookie Store ==========

export interface CookieState {
  customCookies: CustomCookie[];
  sessionCookies: SessionCookie[];
}

export interface CookieActions {
  // Custom Cookies
  addCustomCookie: (cookie: CustomCookie) => void;
  updateCustomCookie: (index: number, cookie: Partial<CustomCookie>) => void;
  removeCustomCookie: (index: number) => void;
  clearCustomCookies: () => void;
  // Session Cookies
  setSessionCookies: (cookies: SessionCookie[]) => void;
  addSessionCookies: (cookies: SessionCookie[]) => void;
  clearSessionCookies: () => void;
  removeExpiredCookies: () => number;
}

export type CookieStore = CookieState & { actions: CookieActions };

export const useCookieStore = create<CookieStore>()(
  persist(
    (set, get) => ({
      customCookies: [],
      sessionCookies: [],

      actions: {
        addCustomCookie: (cookie) =>
          set((state) => ({
            customCookies: [...state.customCookies, cookie],
          })),

        updateCustomCookie: (index, cookie) =>
          set((state) => {
            const newCookies = [...state.customCookies];
            newCookies[index] = { ...newCookies[index], ...cookie };
            return { customCookies: newCookies };
          }),

        removeCustomCookie: (index) =>
          set((state) => ({
            customCookies: state.customCookies.filter((_, i) => i !== index),
          })),

        clearCustomCookies: () => set({ customCookies: [] }),

        setSessionCookies: (cookies: SessionCookie[]) => set({ sessionCookies: cookies }),

        addSessionCookies: (cookies: SessionCookie[]) =>
          set((state) => {
            const cookieMap = new Map<string, SessionCookie>();
            for (const cookie of state.sessionCookies) {
              cookieMap.set(cookie.name, cookie);
            }
            for (const cookie of cookies) {
              cookieMap.set(cookie.name, cookie);
            }
            return { sessionCookies: Array.from(cookieMap.values()) };
          }),

        clearSessionCookies: () => set({ sessionCookies: [] }),

        removeExpiredCookies: (): number => {
          const currentCookies = get().sessionCookies;
          const validCookies = filterExpiredCookies(currentCookies);
          const removedCount = currentCookies.length - validCookies.length;
          if (removedCount > 0) {
            set({ sessionCookies: validCookies });
          }
          return removedCount;
        },
      },
    }),
    {
      name: 'api-tester-cookies',
      version: 1,
      partialize: (state) => ({
        customCookies: state.customCookies,
        sessionCookies: filterExpiredCookies(state.sessionCookies),
      }),
    },
  ),
);

// Actions - can be used outside of React components
export const cookieStoreActions = useCookieStore.getState().actions;

// Selector hooks
export const useCustomCookies = () => useCookieStore((s) => s.customCookies);
export const useSessionCookies = () => useCookieStore((s) => s.sessionCookies);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type SessionCookie, type CookieStore } from './cookie-types.ts';
import { filterExpiredCookies } from '../lib/cookie-expired-check.ts';

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

export const cookieStoreActions = useCookieStore.getState().actions;

export const useCustomCookies = () => useCookieStore((s) => s.customCookies);
export const useSessionCookies = () => useCookieStore((s) => s.sessionCookies);

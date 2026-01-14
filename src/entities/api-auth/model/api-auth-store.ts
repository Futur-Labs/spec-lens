import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ApiAuthConfig, type ApiAuthStore } from './api-auth-types.ts';

const DEFAULT_AUTH_CONFIG: ApiAuthConfig = {
  type: 'none',
  apiKeyLocation: 'header',
  persistSession: false,
};

const useApiAuthStore = create<ApiAuthStore>()(
  persist(
    (set) => ({
      apiAuthConfig: DEFAULT_AUTH_CONFIG,

      actions: {
        setApiAuthConfig: (config) =>
          set((state) => ({
            apiAuthConfig: { ...state.apiAuthConfig, ...config },
          })),

        clearAuth: () => set({ apiAuthConfig: DEFAULT_AUTH_CONFIG }),
      },
    }),
    {
      name: 'api-tester-auth',
      version: 1,
      partialize: (state) =>
        state.apiAuthConfig.persistSession ? { authConfig: state.apiAuthConfig } : {},
    },
  ),
);

// Actions - can be used outside of React components
export const apiAuthStoreActions = useApiAuthStore.getState().actions;

// Selector hooks
export const useAuthConfig = () => useApiAuthStore((s) => s.apiAuthConfig);

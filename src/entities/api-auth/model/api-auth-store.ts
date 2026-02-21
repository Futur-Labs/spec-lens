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
        state.apiAuthConfig.persistSession ? { apiAuthConfig: state.apiAuthConfig } : {},
    },
  ),
);

export const apiAuthStoreActions = useApiAuthStore.getState().actions;

export const useAuthConfig = () => useApiAuthStore((s) => s.apiAuthConfig);

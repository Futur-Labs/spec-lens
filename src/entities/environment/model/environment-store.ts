import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EnvironmentStore } from './environment-types.ts';

export const useEnvironmentStore = create<EnvironmentStore>()(
  persist(
    (set) => ({
      environments: [],
      activeEnvironmentId: null,

      actions: {
        addEnvironment: (env) =>
          set((state) => ({
            environments: [...state.environments, env],
          })),

        updateEnvironment: (id, updates) =>
          set((state) => ({
            environments: state.environments.map((env) =>
              env.id === id ? { ...env, ...updates } : env,
            ),
          })),

        removeEnvironment: (id) =>
          set((state) => ({
            environments: state.environments.filter((env) => env.id !== id),
            // 활성 환경 삭제 시 비활성화
            activeEnvironmentId:
              state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
          })),

        setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),
      },
    }),
    {
      name: 'api-tester-environments',
      version: 1,
      partialize: (state) => ({
        environments: state.environments,
        activeEnvironmentId: state.activeEnvironmentId,
      }),
    },
  ),
);

export const environmentStoreActions = useEnvironmentStore.getState().actions;

export const useEnvironments = () => useEnvironmentStore((s) => s.environments);

export const useActiveEnvironmentId = () => useEnvironmentStore((s) => s.activeEnvironmentId);

export const useActiveEnvironment = () =>
  useEnvironmentStore(
    (s) => s.environments.find((env) => env.id === s.activeEnvironmentId) ?? null,
  );

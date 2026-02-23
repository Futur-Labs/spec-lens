import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EnvironmentStore } from './environment-types.ts';

export const useEnvironmentStore = create<EnvironmentStore>()(
  persist(
    (set) => ({
      environments: [],
      activeEnvironmentIds: [],

      actions: {
        addEnvironment: (env) =>
          set((state) => ({
            environments: [...state.environments, env],
            // 새 환경 추가 시 자동 활성화
            activeEnvironmentIds: [...state.activeEnvironmentIds, env.id],
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
            activeEnvironmentIds: state.activeEnvironmentIds.filter((eid) => eid !== id),
          })),

        toggleEnvironment: (id) =>
          set((state) => ({
            activeEnvironmentIds: state.activeEnvironmentIds.includes(id)
              ? state.activeEnvironmentIds.filter((eid) => eid !== id)
              : [...state.activeEnvironmentIds, id],
          })),
      },
    }),
    {
      name: 'api-tester-environments',
      version: 2,
      partialize: (state) => ({
        environments: state.environments,
        activeEnvironmentIds: state.activeEnvironmentIds,
      }),
      migrate: (persisted: unknown) => {
        const state = persisted as Record<string, unknown>;
        // v1 → v2: activeEnvironmentId → activeEnvironmentIds
        if ('activeEnvironmentId' in state && !('activeEnvironmentIds' in state)) {
          const oldId = state.activeEnvironmentId as string | null;
          return {
            ...state,
            activeEnvironmentIds: oldId ? [oldId] : [],
          } as EnvironmentStore;
        }
        return state as EnvironmentStore;
      },
    },
  ),
);

export const environmentStoreActions = useEnvironmentStore.getState().actions;

export const useEnvironments = () => useEnvironmentStore((s) => s.environments);

export const useActiveEnvironmentIds = () => useEnvironmentStore((s) => s.activeEnvironmentIds);

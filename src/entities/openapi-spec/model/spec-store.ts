import { useEffect, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { OpenAPISpec } from './openapi-types.ts';
import type { SpecState, SpecStore, SpecSource } from './spec-types.ts';
import { parseEndpoints, getAllTags } from '../lib/parse-endpoints.ts';
import { testParamsStoreActions } from '@/entities/test-params/@x/openapi-spec.ts';

const initialState: SpecState = {
  spec: null,
  specSource: null,
  endpoints: [],
  tags: [],
  isLoading: false,
  error: null,
  isRefreshing: false,
  lastRefreshTime: null,
  refreshError: null,
};

export const useSpecStore = create<SpecStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      actions: {
        setSpec: (spec: OpenAPISpec, source: SpecSource) => {
          const prevSource = get().specSource;
          const endpoints = parseEndpoints(spec);
          const tags = getAllTags(spec);

          // Clear test params when spec source changes (different file/URL)
          const prevSourceId = prevSource?.name || 'default';
          const newSourceId = source?.name || 'default';
          if (prevSource && prevSourceId !== newSourceId) {
            testParamsStoreActions.clearAllParams(prevSourceId);
          }

          set({
            spec,
            specSource: source,
            endpoints,
            tags,
            error: null,
            isLoading: false,
            isRefreshing: false,
            lastRefreshTime: Date.now(),
            refreshError: null,
          });
        },

        clearSpec: () => {
          set({
            ...initialState,
          });
        },

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error, isLoading: false }),

        setRefreshing: (isRefreshing) => set({ isRefreshing }),

        setRefreshError: (refreshError) => set({ refreshError, isRefreshing: false }),

        updateSpecSource: (sourceUpdate) =>
          set((state) => ({
            specSource: state.specSource ? { ...state.specSource, ...sourceUpdate } : null,
          })),
      },
    }),
    {
      name: 'openapi-spec-store',
      version: 1,
      partialize: (state) => ({
        spec: state.spec,
        specSource: state.specSource,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        // Re-parse endpoints and tags from stored spec after hydration
        if (state?.spec) {
          const endpoints = parseEndpoints(state.spec);
          const tags = getAllTags(state.spec);
          useSpecStore.setState({
            endpoints,
            tags,
          });
        }
      },
    },
  ),
);

// Actions - can be used outside of React components
export const specStoreActions = useSpecStore.getState().actions;

// Selector hooks
export const useSpec = () => useSpecStore((state) => state.spec);
export const useSpecSource = () => useSpecStore((state) => state.specSource);
export const useEndpoints = () => useSpecStore((state) => state.endpoints);
export const useTags = () => useSpecStore((state) => state.tags);
export const useIsLoading = () => useSpecStore((state) => state.isLoading);
export const useError = () => useSpecStore((state) => state.error);
export const useIsRefreshing = () => useSpecStore((state) => state.isRefreshing);
export const useLastRefreshTime = () => useSpecStore((state) => state.lastRefreshTime);
export const useRefreshError = () => useSpecStore((state) => state.refreshError);

// Hydration hook for SSR - uses persist's built-in hydration tracking
const emptySubscribe = () => () => {};

export function useSpecStoreHydration(onHydrated?: () => void) {
  const hydrated = useSyncExternalStore(
    useSpecStore.persist?.onFinishHydration ?? emptySubscribe,
    () => useSpecStore.persist?.hasHydrated() ?? false,
    () => false, // SSR always returns false
  );

  useEffect(() => {
    if (hydrated && onHydrated) {
      onHydrated();
    }
  }, [hydrated, onHydrated]);

  // Trigger rehydration on client mount
  if (!hydrated && typeof window !== 'undefined' && useSpecStore.persist) {
    useSpecStore.persist.rehydrate();
  }

  return hydrated;
}

import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ApiSpec } from './api-types.ts';
import type { SpecSource } from './spec-types.ts';
import { parseEndpoints } from '../lib/parse-endpoints.ts';

const MAX_HISTORY_ENTRIES = 5;

export type SpecHistoryEntry = {
  id: string;
  type: 'file' | 'url';
  name: string;
  title: string;
  version: string;
  endpointCount: number;
  timestamp: number;
  spec: ApiSpec;
  specSource: SpecSource;
};

type SpecHistoryState = {
  entries: SpecHistoryEntry[];
};

type SpecHistoryActions = {
  addEntry: (spec: ApiSpec, source: SpecSource) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
};

type SpecHistoryStore = SpecHistoryState & { actions: SpecHistoryActions };

const useSpecHistoryStore = create<SpecHistoryStore>()(
  persist(
    (set) => ({
      entries: [],

      actions: {
        addEntry: (spec: ApiSpec, source: SpecSource) => {
          const entry: SpecHistoryEntry = {
            id: crypto.randomUUID(),
            type: source.type,
            name: source.name,
            title: spec.info?.title || 'Untitled',
            version: spec.info?.version || '',
            endpointCount: parseEndpoints(spec).length,
            timestamp: Date.now(),
            spec,
            specSource: source,
          };

          set((state) => {
            // URL: 동일 URL은 항상 같은 콘텐츠이므로 중복 제거
            // File: 같은 이름이라도 내용이 다를 수 있으므로 중복 제거하지 않음
            const filtered =
              source.type === 'url'
                ? state.entries.filter((e) => !(e.type === 'url' && e.name === source.name))
                : state.entries;
            const updated = [entry, ...filtered];
            return { entries: updated.slice(0, MAX_HISTORY_ENTRIES) };
          });
        },

        removeEntry: (id: string) => {
          set((state) => ({
            entries: state.entries.filter((e) => e.id !== id),
          }));
        },

        clearAll: () => {
          set({ entries: [] });
        },
      },
    }),
    {
      name: 'spec-history-storage',
      version: 1,
      partialize: (state) => ({
        entries: state.entries,
      }),
      skipHydration: true,
    },
  ),
);

export const specHistoryActions = useSpecHistoryStore.getState().actions;

export const useSpecHistoryEntries = () => useSpecHistoryStore((state) => state.entries);

// Hydration hook for SSR
const emptySubscribe = () => () => {};

export function useSpecHistoryHydration() {
  const hydrated = useSyncExternalStore(
    useSpecHistoryStore.persist?.onFinishHydration ?? emptySubscribe,
    () => useSpecHistoryStore.persist?.hasHydrated() ?? false,
    () => false,
  );

  if (!hydrated && typeof window !== 'undefined' && useSpecHistoryStore.persist) {
    useSpecHistoryStore.persist.rehydrate();
  }

  return hydrated;
}

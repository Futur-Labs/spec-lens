import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';

import type { HistoryStore } from './history-types.ts';
import { indexedDBStorage } from '@/shared/lib';

const MAX_HISTORY_ENTRIES = 200;

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],

      actions: {
        addToHistory: (entry) =>
          set((state) => ({
            history: [entry, ...state.history].slice(0, MAX_HISTORY_ENTRIES),
          })),

        removeHistoryEntry: (id: string) =>
          set((state) => ({
            history: state.history.filter((h) => h.id !== id),
          })),

        clearHistory: () => set({ history: [] }),

        clearHistoryBySpec: (specId: string) =>
          set((state) => ({
            history: state.history.filter((h) => h.specId !== specId),
          })),
      },
    }),
    {
      name: 'api-tester-history',
      version: 1,
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        history: state.history.map((entry) => {
          if (!entry.response) return entry;

          const dataStr = JSON.stringify(entry.response.data);
          const isTooLarge = dataStr.length > 100000;

          return {
            ...entry,
            response: isTooLarge
              ? { ...entry.response, data: '[Response too large]' }
              : entry.response,
          };
        }),
      }),
    },
  ),
);

export const historyStoreActions = useHistoryStore.getState().actions;

export const useHistory = () => useHistoryStore((s) => s.history);

export function useHistoryBySpec(specId: string | null) {
  return useHistoryStore(
    useShallow((s) => (specId ? s.history.filter((h) => h.specId === specId) : s.history)),
  );
}

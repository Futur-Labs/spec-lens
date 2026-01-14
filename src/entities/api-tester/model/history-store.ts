import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { HistoryStore } from './api-request-history-types.ts';

const MAX_HISTORY_ENTRIES = 100;

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
      },
    }),
    {
      name: 'api-tester-history',
      version: 1,
      partialize: (state) => ({
        history: state.history.map((entry) => {
          if (!entry.response) return entry;

          const dataStr = JSON.stringify(entry.response.data);
          const isTooLarge = dataStr.length > 10000;

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

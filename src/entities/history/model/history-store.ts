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

          const data = entry.response.data;
          // 이미 truncated된 엔트리는 스킵
          if (data === '[Response too large]') return entry;
          // 문자열은 직접 길이 체크 (JSON.stringify 불필요)
          if (typeof data === 'string') {
            return data.length > 100000
              ? { ...entry, response: { ...entry.response, data: '[Response too large]' } }
              : entry;
          }
          // 객체/배열만 JSON.stringify
          const dataStr = JSON.stringify(data);
          return dataStr.length > 100000
            ? { ...entry, response: { ...entry.response, data: '[Response too large]' } }
            : entry;
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

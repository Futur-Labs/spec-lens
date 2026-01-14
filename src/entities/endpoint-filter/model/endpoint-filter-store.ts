import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { HttpMethod } from '@/shared/type';

import type { EndpointFilterState, EndpointFilterStore } from './endpoint-filter-types.ts';

const initialState: EndpointFilterState = {
  searchQuery: '',
  selectedTags: [],
  selectedMethods: [],
};

export const useEndpointFilterStore = create<EndpointFilterStore>()(
  persist(
    (set) => ({
      ...initialState,

      actions: {
        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
        },

        toggleTag: (tag: string) => {
          set((state) => ({
            selectedTags: state.selectedTags.includes(tag)
              ? state.selectedTags.filter((t) => t !== tag)
              : [...state.selectedTags, tag],
          }));
        },

        toggleMethod: (method: HttpMethod) => {
          set((state) => ({
            selectedMethods: state.selectedMethods.includes(method)
              ? state.selectedMethods.filter((m) => m !== method)
              : [...state.selectedMethods, method],
          }));
        },

        clearFilters: () => {
          set({
            searchQuery: '',
            selectedTags: [],
            selectedMethods: [],
          });
        },
      },
    }),
    {
      name: 'endpoint-filter-storage',
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedTags: state.selectedTags,
        selectedMethods: state.selectedMethods,
      }),
      skipHydration: true,
    },
  ),
);

// Actions (safe for SSR - no state access)
export const endpointFilterStoreActions = useEndpointFilterStore.getState().actions;

// Selector hooks
export const useSearchQuery = () => useEndpointFilterStore((state) => state.searchQuery);
export const useSelectedTags = () => useEndpointFilterStore((state) => state.selectedTags);
export const useSelectedMethods = () => useEndpointFilterStore((state) => state.selectedMethods);

// SSR-safe hydration hook
const emptySubscribe = () => () => {};

export function useEndpointFilterStoreHydration() {
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (hydrated) {
    useEndpointFilterStore.persist.rehydrate();
  }

  return hydrated;
}

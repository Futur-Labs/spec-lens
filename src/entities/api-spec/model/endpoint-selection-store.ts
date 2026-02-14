import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EndpointSelectionState, EndpointSelectionStore } from './endpoint-selection-types.ts';
import type { HttpMethod } from '@/shared/type';

const initialState: EndpointSelectionState = {
  selectedEndpoint: null,
};

export const useEndpointSelectionStore = create<EndpointSelectionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      actions: {
        selectEndpoint: (path: string, method: HttpMethod) => {
          const { selectedEndpoint } = get();
          if (selectedEndpoint?.path === path && selectedEndpoint?.method === method) return;

          set({ selectedEndpoint: { path, method } });
        },

        clearSelection: () => {
          set({ selectedEndpoint: null });
        },
      },
    }),
    {
      name: 'endpoint-selection-storage',
      partialize: (state) => ({
        selectedEndpoint: state.selectedEndpoint,
      }),
      skipHydration: true,
    },
  ),
);

// Actions (safe for SSR - no state access)
export const endpointSelectionStoreActions = useEndpointSelectionStore.getState().actions;

// Selector hooks
export const useSelectedEndpoint = () =>
  useEndpointSelectionStore((state) => state.selectedEndpoint);

// SSR-safe hydration hook
const emptySubscribe = () => () => {};

export function useEndpointSelectionStoreHydration() {
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (hydrated) {
    useEndpointSelectionStore.persist.rehydrate();
  }

  return hydrated;
}

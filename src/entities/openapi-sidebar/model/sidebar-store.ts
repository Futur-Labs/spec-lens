import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SidebarState, SidebarStore } from './sidebar-types.ts';

const initialState: SidebarState = {
  isSidebarOpen: true,
  expandedTags: [],
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      ...initialState,

      actions: {
        toggleSidebar: () => {
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
        },

        setSidebarOpen: (open: boolean) => {
          set({ isSidebarOpen: open });
        },

        toggleTagExpanded: (tag: string) => {
          set((state) => ({
            expandedTags: state.expandedTags.includes(tag)
              ? state.expandedTags.filter((t) => t !== tag)
              : [...state.expandedTags, tag],
          }));
        },

        expandAllTags: (tags: string[]) => {
          set({ expandedTags: [...tags] });
        },

        collapseAllTags: () => {
          set({ expandedTags: [] });
        },
      },
    }),
    {
      name: 'openapi-sidebar-storage',
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        expandedTags: state.expandedTags,
      }),
      skipHydration: true,
    },
  ),
);

export const sidebarStoreActions = useSidebarStore.getState().actions;

// Selector hooks
export const useIsSidebarOpen = () => useSidebarStore((state) => state.isSidebarOpen);
export const useExpandedTags = () => useSidebarStore((state) => state.expandedTags);

// SSR-safe hydration hook
const emptySubscribe = () => () => {};

export function useSidebarStoreHydration() {
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (hydrated) {
    useSidebarStore.persist.rehydrate();
  }

  return hydrated;
}

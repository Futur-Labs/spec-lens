import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type OpenAPIState, type OpenAPIStore } from './openapi-store-types.ts';
import {
  parseEndpoints,
  groupEndpointsByTag,
  getAllTags,
  filterEndpoints,
} from '../lib/openapi-parser.ts';

const initialState: OpenAPIState = {
  spec: null,
  specSource: null,
  endpoints: [],
  tags: [],
  selectedEndpoint: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedTags: [],
  selectedMethods: [],
  isSidebarOpen: true,
  expandedTags: [],
};

export const useOpenAPIStore = create<OpenAPIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSpec: (spec, source) => {
        const endpoints = parseEndpoints(spec);
        const tags = getAllTags(spec);

        set({
          spec,
          specSource: source,
          endpoints,
          tags,
          error: null,
          isLoading: false,
          selectedEndpoint: null,
          expandedTags: tags,
        });
      },

      clearSpec: () => {
        set({
          ...initialState,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      selectEndpoint: (path, method) => {
        set({ selectedEndpoint: { path, method } });
      },

      clearSelection: () => set({ selectedEndpoint: null }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      toggleTag: (tag) => {
        const { selectedTags } = get();
        const newTags = selectedTags.includes(tag)
          ? selectedTags.filter((t) => t !== tag)
          : [...selectedTags, tag];
        set({ selectedTags: newTags });
      },

      toggleMethod: (method) => {
        const { selectedMethods } = get();
        const newMethods = selectedMethods.includes(method)
          ? selectedMethods.filter((m) => m !== method)
          : [...selectedMethods, method];
        set({ selectedMethods: newMethods });
      },

      clearFilters: () => {
        set({
          searchQuery: '',
          selectedTags: [],
          selectedMethods: [],
        });
      },

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

      toggleTagExpanded: (tag) => {
        const { expandedTags } = get();
        const newExpanded = expandedTags.includes(tag)
          ? expandedTags.filter((t) => t !== tag)
          : [...expandedTags, tag];
        set({ expandedTags: newExpanded });
      },

      expandAllTags: () => {
        const { tags } = get();
        set({ expandedTags: [...tags] });
      },

      collapseAllTags: () => {
        set({ expandedTags: [] });
      },

      getFilteredEndpoints: () => {
        const { endpoints, searchQuery, selectedTags, selectedMethods } = get();
        return filterEndpoints(endpoints, {
          searchQuery,
          selectedTags,
          selectedMethods,
        });
      },

      getEndpointsByTag: () => {
        const filteredEndpoints = get().getFilteredEndpoints();
        return groupEndpointsByTag(filteredEndpoints);
      },

      getSelectedEndpointData: () => {
        const { endpoints, selectedEndpoint } = get();
        if (!selectedEndpoint) return null;

        return (
          endpoints.find(
            (e) => e.path === selectedEndpoint.path && e.method === selectedEndpoint.method,
          ) || null
        );
      },
    }),
    {
      name: 'openapi-store',
      partialize: (state) => ({
        specSource: state.specSource,
        isSidebarOpen: state.isSidebarOpen,
        expandedTags: state.expandedTags,
      }),
    },
  ),
);

// Selector hooks
export const useSpec = () => useOpenAPIStore((state) => state.spec);
export const useSpecSource = () => useOpenAPIStore((state) => state.specSource);
export const useEndpoints = () => useOpenAPIStore((state) => state.endpoints);
export const useTags = () => useOpenAPIStore((state) => state.tags);
export const useSelectedEndpoint = () => useOpenAPIStore((state) => state.selectedEndpoint);
export const useIsLoading = () => useOpenAPIStore((state) => state.isLoading);
export const useError = () => useOpenAPIStore((state) => state.error);
export const useSearchQuery = () => useOpenAPIStore((state) => state.searchQuery);
export const useSelectedTags = () => useOpenAPIStore((state) => state.selectedTags);
export const useSelectedMethods = () => useOpenAPIStore((state) => state.selectedMethods);
export const useIsSidebarOpen = () => useOpenAPIStore((state) => state.isSidebarOpen);
export const useExpandedTags = () => useOpenAPIStore((state) => state.expandedTags);

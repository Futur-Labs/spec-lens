import type { HttpMethod } from '@/shared/type';

export type EndpointFilterState = {
  searchQuery: string;
  selectedTags: string[];
  selectedMethods: HttpMethod[];
};

export type EndpointFilterActions = {
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  toggleMethod: (method: HttpMethod) => void;
  clearMethods: () => void;
  clearTags: () => void;
  clearFilters: () => void;
};

export type EndpointFilterStore = EndpointFilterState & { actions: EndpointFilterActions };

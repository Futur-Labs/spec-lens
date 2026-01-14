import { type OpenAPISpec, type ParsedEndpoint } from './openapi-types.ts';
import type { HttpMethod } from '@/shared/type';

export interface SpecSource {
  type: 'file' | 'url';
  name: string;
  // For URL sources - used for refresh/update detection
  etag?: string | null;
  lastModified?: string | null;
}

export interface SelectedEndpoint {
  path: string;
  method: HttpMethod;
}

export interface OpenAPIState {
  // Spec data
  spec: OpenAPISpec | null;
  specSource: SpecSource | null;

  // Parsed data (derived from spec)
  endpoints: ParsedEndpoint[];
  tags: string[];

  // UI state
  selectedEndpoint: SelectedEndpoint | null;
  isLoading: boolean;
  error: string | null;

  // Refresh state
  isRefreshing: boolean;
  lastRefreshTime: number | null;
  refreshError: string | null;

  // Filter state
  searchQuery: string;
  selectedTags: string[];
  selectedMethods: HttpMethod[];

  // Sidebar state
  isSidebarOpen: boolean;
  expandedTags: string[];
}

export interface RefreshResult {
  updated: boolean;
  message: string;
}

export interface OpenAPIActions {
  // Spec actions
  setSpec: (spec: OpenAPISpec, source: SpecSource) => void;
  clearSpec: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Refresh actions (for URL sources)
  setRefreshing: (refreshing: boolean) => void;
  setRefreshError: (error: string | null) => void;
  updateSpecSource: (source: Partial<SpecSource>) => void;

  // Selection actions
  selectEndpoint: (path: string, method: HttpMethod) => void;
  clearSelection: () => void;

  // Filter actions
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  toggleMethod: (method: HttpMethod) => void;
  clearFilters: () => void;

  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTagExpanded: (tag: string) => void;
  expandAllTags: () => void;
  collapseAllTags: () => void;

  // Computed getters
  getFilteredEndpoints: () => ParsedEndpoint[];
  getEndpointsByTag: () => Record<string, ParsedEndpoint[]>;
  getSelectedEndpointData: () => ParsedEndpoint | null;
}

export type OpenAPIStore = OpenAPIState & { actions: OpenAPIActions };

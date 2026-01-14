import type { OpenAPISpec, ParsedEndpoint } from './openapi-types.ts';

export type SpecSource = {
  type: 'file' | 'url';
  name: string;
  // For URL sources - used for refresh/update detection
  etag?: string | null;
  lastModified?: string | null;
};

export type SpecState = {
  // Spec data
  spec: OpenAPISpec | null;
  specSource: SpecSource | null;

  // Parsed data (derived from spec)
  endpoints: ParsedEndpoint[];
  tags: string[];

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Refresh state
  isRefreshing: boolean;
  lastRefreshTime: number | null;
  refreshError: string | null;
};

export type SpecActions = {
  setSpec: (spec: OpenAPISpec, source: SpecSource) => void;
  clearSpec: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRefreshing: (refreshing: boolean) => void;
  setRefreshError: (error: string | null) => void;
  updateSpecSource: (source: Partial<SpecSource>) => void;
};

export type SpecStore = SpecState & { actions: SpecActions };

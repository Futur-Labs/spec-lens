import type { OpenAPISpec, ParsedEndpoint } from './api-types.ts';

export type SpecSource = {
  type: 'file' | 'url';
  name: string;
  etag?: string | null;
  lastModified?: string | null;
};

export type SpecState = {
  spec: OpenAPISpec | null;
  specSource: SpecSource | null;

  endpoints: ParsedEndpoint[];
  tags: string[];

  isLoading: boolean;

  isRefreshing: boolean;
  lastRefreshTime: number | null;
  refreshError: string | null;
};

export type SpecActions = {
  setSpec: (spec: OpenAPISpec, source: SpecSource) => void;
  clearSpec: () => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setRefreshError: (error: string | null) => void;
  updateSpecSource: (source: Partial<SpecSource>) => void;
};

export type SpecStore = SpecState & { actions: SpecActions };

import { create } from 'zustand';

import {
  type ApiTesterState,
  type ApiTesterStore,
  type AuthConfig,
  DEFAULT_AUTH_CONFIG,
  type HistoryEntry,
} from './api-tester-types.ts';

// Load persisted auth config from localStorage
function loadPersistedAuthConfig(): AuthConfig {
  if (typeof window === 'undefined') return DEFAULT_AUTH_CONFIG;

  try {
    const stored = localStorage.getItem('api-tester-auth');
    if (stored) {
      const parsed = JSON.parse(stored) as AuthConfig;
      if (parsed.persistSession) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_AUTH_CONFIG;
}

// Save auth config to localStorage if persistence is enabled
function saveAuthConfig(config: AuthConfig): void {
  if (typeof window === 'undefined') return;

  if (config.persistSession) {
    localStorage.setItem('api-tester-auth', JSON.stringify(config));
  } else {
    localStorage.removeItem('api-tester-auth');
  }
}

const initialState: ApiTesterState = {
  selectedServer: '',
  authConfig: loadPersistedAuthConfig(),
  pathParams: {},
  queryParams: {},
  headers: {
    'Content-Type': 'application/json',
  },
  requestBody: '',
  response: null,
  isExecuting: false,
  executeError: null,
  history: [],
};

export const useApiTesterStore = create<ApiTesterStore>((set) => ({
  ...initialState,

  actions: {
    setSelectedServer: (selectedServer) => set({ selectedServer }),

    setAuthConfig: (config) =>
      set((state) => {
        const newAuthConfig = { ...state.authConfig, ...config };
        saveAuthConfig(newAuthConfig);
        return { authConfig: newAuthConfig };
      }),

    clearAuth: () =>
      set(() => {
        saveAuthConfig(DEFAULT_AUTH_CONFIG);
        return { authConfig: DEFAULT_AUTH_CONFIG };
      }),

    setPathParam: (key, value) =>
      set((state) => ({
        pathParams: { ...state.pathParams, [key]: value },
      })),

    setQueryParam: (key, value) =>
      set((state) => ({
        queryParams: { ...state.queryParams, [key]: value },
      })),

    setHeader: (key, value) =>
      set((state) => ({
        headers: { ...state.headers, [key]: value },
      })),

    removeHeader: (key) =>
      set((state) => {
        const { [key]: _, ...rest } = state.headers;
        return { headers: rest };
      }),

    setRequestBody: (requestBody) => set({ requestBody }),

    setResponse: (response) => set({ response, isExecuting: false, executeError: null }),

    setExecuting: (isExecuting) => set({ isExecuting }),

    setExecuteError: (executeError) => set({ executeError, isExecuting: false }),

    clearResponse: () => set({ response: null, executeError: null }),

    resetParams: () =>
      set({
        pathParams: {},
        queryParams: {},
        headers: { 'Content-Type': 'application/json' },
        requestBody: '',
        response: null,
        executeError: null,
      }),

    addToHistory: (entry: HistoryEntry) =>
      set((state) => ({
        history: [entry, ...state.history].slice(0, 50),
      })),

    clearHistory: () => set({ history: [] }),
  },
}));

// Actions - can be used outside of React components
export const apiTesterStoreActions = useApiTesterStore.getState().actions;

// Selector hooks
export const useSelectedServer = () => useApiTesterStore((s) => s.selectedServer);
export const useAuthConfig = () => useApiTesterStore((s) => s.authConfig);
export const usePathParams = () => useApiTesterStore((s) => s.pathParams);
export const useQueryParams = () => useApiTesterStore((s) => s.queryParams);
export const useHeaders = () => useApiTesterStore((s) => s.headers);
export const useRequestBody = () => useApiTesterStore((s) => s.requestBody);
export const useResponse = () => useApiTesterStore((s) => s.response);
export const useIsExecuting = () => useApiTesterStore((s) => s.isExecuting);
export const useExecuteError = () => useApiTesterStore((s) => s.executeError);

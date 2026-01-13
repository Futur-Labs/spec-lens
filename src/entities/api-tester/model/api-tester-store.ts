import { create } from 'zustand';

import {
  type ApiTesterState,
  type ApiTesterStore,
  type AuthConfig,
  type CustomCookie,
  type SessionCookie,
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

// Load persisted custom cookies from localStorage
function loadPersistedCookies(): CustomCookie[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('api-tester-cookies');
    if (stored) {
      return JSON.parse(stored) as CustomCookie[];
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

// Save custom cookies to localStorage
function saveCookies(cookies: CustomCookie[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('api-tester-cookies', JSON.stringify(cookies));
}

const initialState: ApiTesterState = {
  selectedServer: '',
  authConfig: loadPersistedAuthConfig(),
  customCookies: loadPersistedCookies(),
  sessionCookies: [],
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

    addCustomCookie: (cookie) =>
      set((state) => {
        const newCookies = [...state.customCookies, cookie];
        saveCookies(newCookies);
        return { customCookies: newCookies };
      }),

    updateCustomCookie: (index, cookie) =>
      set((state) => {
        const newCookies = [...state.customCookies];
        newCookies[index] = { ...newCookies[index], ...cookie };
        saveCookies(newCookies);
        return { customCookies: newCookies };
      }),

    removeCustomCookie: (index) =>
      set((state) => {
        const newCookies = state.customCookies.filter((_, i) => i !== index);
        saveCookies(newCookies);
        return { customCookies: newCookies };
      }),

    clearCustomCookies: () =>
      set(() => {
        saveCookies([]);
        return { customCookies: [] };
      }),

    setSessionCookies: (cookies: SessionCookie[]) => set({ sessionCookies: cookies }),

    addSessionCookies: (cookies: SessionCookie[]) =>
      set((state) => {
        // Merge cookies by name (newer values override)
        const cookieMap = new Map<string, SessionCookie>();
        for (const cookie of state.sessionCookies) {
          cookieMap.set(cookie.name, cookie);
        }
        for (const cookie of cookies) {
          cookieMap.set(cookie.name, cookie);
        }
        return { sessionCookies: Array.from(cookieMap.values()) };
      }),

    clearSessionCookies: () => set({ sessionCookies: [] }),

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
export const useCustomCookies = () => useApiTesterStore((s) => s.customCookies);
export const useSessionCookies = () => useApiTesterStore((s) => s.sessionCookies);
export const usePathParams = () => useApiTesterStore((s) => s.pathParams);
export const useQueryParams = () => useApiTesterStore((s) => s.queryParams);
export const useHeaders = () => useApiTesterStore((s) => s.headers);
export const useRequestBody = () => useApiTesterStore((s) => s.requestBody);
export const useResponse = () => useApiTesterStore((s) => s.response);
export const useIsExecuting = () => useApiTesterStore((s) => s.isExecuting);
export const useExecuteError = () => useApiTesterStore((s) => s.executeError);

import { create } from 'zustand';

import type { EndpointTestData, PersistedTestParams, ResponseState } from './api-tester-types.ts';

// ========== Storage Helpers ==========

// Generate storage key for spec-specific test params
function getTestParamsStorageKey(specSourceId: string): string {
  return `api-tester-params-${specSourceId}`;
}

// Load all persisted test params for a spec
function loadPersistedTestParams(specSourceId: string): PersistedTestParams {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(getTestParamsStorageKey(specSourceId));
    if (stored) {
      return JSON.parse(stored) as PersistedTestParams;
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

// Save all test params for a spec
function savePersistedTestParams(specSourceId: string, params: PersistedTestParams): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(getTestParamsStorageKey(specSourceId), JSON.stringify(params));
  } catch (error) {
    // localStorage might be full - try saving without response data
    console.warn('Failed to save test params, trying without response data:', error);
    try {
      const paramsWithoutResponse: PersistedTestParams = {};
      for (const [key, value] of Object.entries(params)) {
        paramsWithoutResponse[key] = { ...value, response: null };
      }
      localStorage.setItem(
        getTestParamsStorageKey(specSourceId),
        JSON.stringify(paramsWithoutResponse),
      );
    } catch {
      // If still fails, ignore
      console.warn('Failed to save test params even without response data');
    }
  }
}

// Load test data for a specific endpoint
function loadEndpointTestData(specSourceId: string, endpointKey: string): EndpointTestData | null {
  const allParams = loadPersistedTestParams(specSourceId);
  return allParams[endpointKey] || null;
}

// Save test data for a specific endpoint
function saveEndpointTestData(
  specSourceId: string,
  endpointKey: string,
  data: EndpointTestData,
): void {
  const allParams = loadPersistedTestParams(specSourceId);
  allParams[endpointKey] = data;
  savePersistedTestParams(specSourceId, allParams);
}

// Clear test data for a specific endpoint
function clearEndpointTestData(specSourceId: string, endpointKey: string): void {
  const allParams = loadPersistedTestParams(specSourceId);
  delete allParams[endpointKey];
  savePersistedTestParams(specSourceId, allParams);
}

// Clear all test data for a spec
function clearAllTestData(specSourceId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getTestParamsStorageKey(specSourceId));
}

// ========== State & Store ==========

export interface TestParamsState {
  selectedServer: string;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  requestBody: string;
  response: ResponseState | null;
  isExecuting: boolean;
  executeError: string | null;
}

export interface TestParamsActions {
  setSelectedServer: (server: string) => void;
  setPathParam: (key: string, value: string) => void;
  setQueryParam: (key: string, value: string) => void;
  setHeader: (key: string, value: string) => void;
  removeHeader: (key: string) => void;
  setRequestBody: (body: string) => void;
  setResponse: (response: ResponseState) => void;
  setExecuting: (executing: boolean) => void;
  setExecuteError: (error: string | null) => void;
  clearResponse: () => void;
  resetParams: () => void;
  // Endpoint test data persistence
  saveCurrentParams: (specSourceId: string, endpointKey: string) => void;
  loadSavedParams: (specSourceId: string, endpointKey: string) => boolean;
  clearEndpointParams: (specSourceId: string, endpointKey: string) => void;
  clearAllParams: (specSourceId: string) => void;
}

export type TestParamsStore = TestParamsState & { actions: TestParamsActions };

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

const initialState: TestParamsState = {
  selectedServer: '',
  pathParams: {},
  queryParams: {},
  headers: DEFAULT_HEADERS,
  requestBody: '',
  response: null,
  isExecuting: false,
  executeError: null,
};

export const useTestParamsStore = create<TestParamsStore>((set) => ({
  ...initialState,

  actions: {
    setSelectedServer: (selectedServer) => set({ selectedServer }),

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
        headers: DEFAULT_HEADERS,
        requestBody: '',
        response: null,
        executeError: null,
      }),

    // Endpoint test data persistence
    saveCurrentParams: (specSourceId: string, endpointKey: string) => {
      const state = useTestParamsStore.getState();
      const data: EndpointTestData = {
        pathParams: state.pathParams,
        queryParams: state.queryParams,
        headers: state.headers,
        requestBody: state.requestBody,
        selectedServer: state.selectedServer,
        response: state.response,
      };
      saveEndpointTestData(specSourceId, endpointKey, data);
    },

    loadSavedParams: (specSourceId: string, endpointKey: string): boolean => {
      const data = loadEndpointTestData(specSourceId, endpointKey);
      if (data) {
        set({
          pathParams: data.pathParams,
          queryParams: data.queryParams,
          headers: data.headers,
          requestBody: data.requestBody,
          selectedServer: data.selectedServer,
          response: data.response,
          executeError: null,
        });
        return true;
      }
      return false;
    },

    clearEndpointParams: (specSourceId: string, endpointKey: string) => {
      clearEndpointTestData(specSourceId, endpointKey);
      set({
        pathParams: {},
        queryParams: {},
        headers: DEFAULT_HEADERS,
        requestBody: '',
        response: null,
        executeError: null,
      });
    },

    clearAllParams: (specSourceId: string) => {
      clearAllTestData(specSourceId);
      set({
        pathParams: {},
        queryParams: {},
        headers: DEFAULT_HEADERS,
        requestBody: '',
        response: null,
        executeError: null,
      });
    },
  },
}));

// Actions - can be used outside of React components
export const testParamsStoreActions = useTestParamsStore.getState().actions;

// Selector hooks
export const useSelectedServer = () => useTestParamsStore((s) => s.selectedServer);
export const usePathParams = () => useTestParamsStore((s) => s.pathParams);
export const useQueryParams = () => useTestParamsStore((s) => s.queryParams);
export const useHeaders = () => useTestParamsStore((s) => s.headers);
export const useRequestBody = () => useTestParamsStore((s) => s.requestBody);
export const useResponse = () => useTestParamsStore((s) => s.response);
export const useIsExecuting = () => useTestParamsStore((s) => s.isExecuting);
export const useExecuteError = () => useTestParamsStore((s) => s.executeError);

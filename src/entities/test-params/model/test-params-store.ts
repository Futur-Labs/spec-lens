import { del, get, set } from 'idb-keyval';
import { create } from 'zustand';

import type {
  EndpointTestData,
  PersistedTestParams,
  TestParamsState,
  TestParamsStore,
} from './test-params-types.ts';

// ========== Storage Helpers (IndexedDB) ==========

// Storage version - increment when data format changes to invalidate old data
const STORAGE_VERSION = 2; // v2: Added OpenAPI example support

// Generate storage key for spec-specific test params
function getTestParamsStorageKey(specSourceId: string): string {
  return `api-tester-params-v${STORAGE_VERSION}-${specSourceId}`;
}

// Load all persisted test params for a spec
async function loadPersistedTestParams(specSourceId: string): Promise<PersistedTestParams> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = await get<string>(getTestParamsStorageKey(specSourceId));
    if (stored) {
      return JSON.parse(stored) as PersistedTestParams;
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

// Save all test params for a spec
async function savePersistedTestParams(
  specSourceId: string,
  params: PersistedTestParams,
): Promise<void> {
  if (typeof window === 'undefined') return;

  await set(getTestParamsStorageKey(specSourceId), JSON.stringify(params));
}

// Load test data for a specific endpoint
async function loadEndpointTestData(
  specSourceId: string,
  endpointKey: string,
): Promise<EndpointTestData | null> {
  const allParams = await loadPersistedTestParams(specSourceId);
  return allParams[endpointKey] || null;
}

// Save test data for a specific endpoint
async function saveEndpointTestData(
  specSourceId: string,
  endpointKey: string,
  data: EndpointTestData,
): Promise<void> {
  const allParams = await loadPersistedTestParams(specSourceId);
  allParams[endpointKey] = data;
  await savePersistedTestParams(specSourceId, allParams);
}

// Clear test data for a specific endpoint
async function clearEndpointTestData(specSourceId: string, endpointKey: string): Promise<void> {
  const allParams = await loadPersistedTestParams(specSourceId);
  delete allParams[endpointKey];
  await savePersistedTestParams(specSourceId, allParams);
}

// Clear all test data for a spec
async function clearAllTestData(specSourceId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  await del(getTestParamsStorageKey(specSourceId));
}

// ========== State & Store ==========

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

    resetPathParams: () => set({ pathParams: {} }),

    resetQueryParams: () => set({ queryParams: {} }),

    resetHeaders: () => set({ headers: DEFAULT_HEADERS }),

    // Endpoint test data persistence (IndexedDB)
    saveCurrentParams: async (specSourceId, endpointKey) => {
      const state = useTestParamsStore.getState();
      const data: EndpointTestData = {
        pathParams: state.pathParams,
        queryParams: state.queryParams,
        headers: state.headers,
        requestBody: state.requestBody,
        selectedServer: state.selectedServer,
        response: state.response,
      };
      await saveEndpointTestData(specSourceId, endpointKey, data);
    },

    loadSavedParams: async (specSourceId, endpointKey) => {
      const data = await loadEndpointTestData(specSourceId, endpointKey);
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

    clearEndpointParams: async (specSourceId, endpointKey) => {
      await clearEndpointTestData(specSourceId, endpointKey);
      set({
        pathParams: {},
        queryParams: {},
        headers: DEFAULT_HEADERS,
        requestBody: '',
        response: null,
        executeError: null,
      });
    },

    clearAllParams: async (specSourceId) => {
      await clearAllTestData(specSourceId);
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

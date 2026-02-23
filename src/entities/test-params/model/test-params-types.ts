import type { ResponseState } from '@/shared/server';

export type EndpointTestData = {
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  requestBody: string;
  selectedServer: string;
  response: ResponseState | null;
};

export type PersistedTestParams = {
  [endpointKey: string]: EndpointTestData;
};

export type TestParamsState = {
  selectedServer: string;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  requestBody: string;
  response: ResponseState | null;
  isExecuting: boolean;
  executeError: string | null;
};

type TestParamsActions = {
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
  resetPathParams: () => void;
  resetQueryParams: () => void;
  resetHeaders: () => void;
  // Endpoint test data persistence (IndexedDB)
  saveCurrentParams: (specSourceId: string, endpointKey: string) => Promise<void>;
  loadSavedParams: (specSourceId: string, endpointKey: string) => Promise<boolean>;
  clearEndpointParams: (specSourceId: string, endpointKey: string) => Promise<void>;
  clearAllParams: (specSourceId: string) => Promise<void>;
};

export type TestParamsStore = TestParamsState & { actions: TestParamsActions };

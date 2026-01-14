import type { HistoryEntry } from './api-request-history-types';
import { type HttpMethod } from '@/entities/openapi';

export type AuthType = 'none' | 'bearer' | 'apiKey' | 'basic';

export interface AuthConfig {
  type: AuthType;
  // Bearer token
  bearerToken?: string;
  // API Key
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyLocation?: 'header' | 'query';
  // Basic Auth
  basicUsername?: string;
  basicPassword?: string;
  // Persistence
  persistSession?: boolean;
}

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  type: 'none',
  apiKeyLocation: 'header',
  persistSession: false,
};

export interface CustomCookie {
  name: string;
  value: string;
  enabled: boolean;
}

export interface SessionCookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
}

// Variables for parameter/body substitution
export interface Variable {
  name: string;
  value: string;
  description?: string;
}

export interface ExecuteRequestParams {
  baseUrl: string;
  path: string;
  method: HttpMethod;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body?: string;
}

export interface ExecuteRequestOptions extends ExecuteRequestParams {
  authConfig?: AuthConfig;
  customCookies?: CustomCookie[];
}

interface ExecuteResult {
  success: true;
  response: ResponseState;
  setCookies: SessionCookie[];
}

interface ExecuteError {
  success: false;
  error: string;
  duration: number;
}

export type ExecuteRequestResult = ExecuteResult | ExecuteError;

export interface ResponseState {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  duration: number;
  size: number;
}

export interface ApiTesterState {
  // Server
  selectedServer: string;

  // Authentication
  authConfig: AuthConfig;

  // Custom Cookies
  customCookies: CustomCookie[];

  // Session Cookies (from backend Set-Cookie headers)
  sessionCookies: SessionCookie[];

  // Variables (global, shared across all endpoints)
  variables: Variable[];

  // Request params
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  requestBody: string;

  // Response
  response: ResponseState | null;
  isExecuting: boolean;
  executeError: string | null;

  // History
  history: HistoryEntry[];
}

export interface ApiTesterActions {
  setSelectedServer: (server: string) => void;
  // Authentication
  setAuthConfig: (config: Partial<AuthConfig>) => void;
  clearAuth: () => void;
  // Custom Cookies
  addCustomCookie: (cookie: CustomCookie) => void;
  updateCustomCookie: (index: number, cookie: Partial<CustomCookie>) => void;
  removeCustomCookie: (index: number) => void;
  clearCustomCookies: () => void;
  // Session Cookies
  setSessionCookies: (cookies: SessionCookie[]) => void;
  addSessionCookies: (cookies: SessionCookie[]) => void;
  clearSessionCookies: () => void;
  removeExpiredCookies: () => number; // Returns count of removed cookies
  // Variables
  addVariable: (variable: Variable) => void;
  updateVariable: (index: number, variable: Partial<Variable>) => void;
  removeVariable: (index: number) => void;
  clearVariables: () => void;
  // Request params
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
  addToHistory: (entry: HistoryEntry) => void;
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;
  // Endpoint test data persistence
  saveCurrentParams: (specSourceId: string, endpointKey: string) => void;
  loadSavedParams: (specSourceId: string, endpointKey: string) => boolean; // Returns true if data exists
  clearEndpointParams: (specSourceId: string, endpointKey: string) => void;
  clearAllParams: (specSourceId: string) => void;
}

export type ApiTesterStore = ApiTesterState & { actions: ApiTesterActions };

// Persisted test data per endpoint
export interface EndpointTestData {
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  requestBody: string;
  selectedServer: string;
  response: ResponseState | null;
}

export interface PersistedTestParams {
  [endpointKey: string]: EndpointTestData; // key: `${method}:${path}`
}

import type { ResponseState } from '@/shared/server';
import type { HttpMethod } from '@/shared/type';

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

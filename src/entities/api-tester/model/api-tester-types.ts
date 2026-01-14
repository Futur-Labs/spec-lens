import type { CustomCookie, SessionCookie } from '@/entities/cookie/@x/api-tester.ts';
import type { ResponseState } from '@/shared/server';
import type { HttpMethod } from '@/shared/type';

export type AuthType = 'none' | 'bearer' | 'apiKey' | 'basic';

export type AuthConfig = {
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
};

export type ExecuteRequestOptions = {
  baseUrl: string;
  path: string;
  method: HttpMethod;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body?: string;
  authConfig?: AuthConfig;
  customCookies?: CustomCookie[];
};

type ExecuteResult = {
  success: true;
  response: ResponseState;
  setCookies: SessionCookie[];
};

type ExecuteError = {
  success: false;
  error: string;
  duration: number;
};

export type ExecuteRequestResult = ExecuteResult | ExecuteError;

import type { ApiAuthConfig } from '@/entities/api-auth/@x/api-tester.ts';
import type { CustomCookie, SessionCookie } from '@/entities/cookie/@x/api-tester.ts';
import type { ResponseState } from '@/shared/server';
import type { HttpMethod } from '@/shared/type';

export type ExecuteRequestOptions = {
  baseUrl: string;
  path: string;
  method: HttpMethod;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body?: string;
  authConfig?: ApiAuthConfig;
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

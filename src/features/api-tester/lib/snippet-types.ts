import type { ApiAuthConfig } from '@/entities/api-auth';
import type { CustomCookie } from '@/entities/cookie';

export interface SnippetParams {
  baseUrl: string;
  path: string;
  method: string;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body: string;
  authConfig: ApiAuthConfig;
  customCookies: CustomCookie[];
}

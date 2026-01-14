import type { ApiAuthConfig } from '@/entities/api-auth/@x/api-tester.ts';

/**
 * Apply authentication to headers and query params based on auth config
 */
export function applyAuth(
  authConfig: ApiAuthConfig,
  headers: Record<string, string>,
  queryParams: Record<string, string>,
): { headers: Record<string, string>; queryParams: Record<string, string> } {
  const newHeaders = { ...headers };
  const newQueryParams = { ...queryParams };

  switch (authConfig.type) {
    case 'bearer':
      // Only apply if user hasn't set a custom Authorization header
      if (authConfig.bearerToken && !headers['Authorization']) {
        newHeaders['Authorization'] = `Bearer ${authConfig.bearerToken}`;
      }
      break;

    case 'apiKey':
      if (authConfig.apiKeyName && authConfig.apiKeyValue) {
        if (authConfig.apiKeyLocation === 'query') {
          // Only apply if user hasn't set a custom query param with same name
          if (!queryParams[authConfig.apiKeyName]) {
            newQueryParams[authConfig.apiKeyName] = authConfig.apiKeyValue;
          }
        } else {
          // Only apply if user hasn't set a custom header with same name
          if (!headers[authConfig.apiKeyName]) {
            newHeaders[authConfig.apiKeyName] = authConfig.apiKeyValue;
          }
        }
      }
      break;

    case 'basic':
      // Only apply if user hasn't set a custom Authorization header
      if (authConfig.basicUsername && !headers['Authorization']) {
        const credentials = btoa(`${authConfig.basicUsername}:${authConfig.basicPassword || ''}`);
        newHeaders['Authorization'] = `Basic ${credentials}`;
      }
      break;

    case 'none':
    default:
      // No authentication
      break;
  }

  return { headers: newHeaders, queryParams: newQueryParams };
}

import type {
  AuthConfig,
  CustomCookie,
  ExecuteRequestParams,
  ExecuteRequestResult,
} from '../model/api-tester-types';
import { proxyApiRequest, type ProxyResponse } from '@/shared/server/proxy-api-request';

/**
 * Build the full URL with path parameters replaced
 */
function buildUrl(baseUrl: string, path: string, pathParams: Record<string, string>): string {
  let resolvedPath = path;

  // Replace {param} placeholders with actual values
  Object.entries(pathParams).forEach(([key, value]) => {
    resolvedPath = resolvedPath.replace(new RegExp(`\\{${key}\\}`, 'g'), encodeURIComponent(value));
  });

  // Remove trailing slash from baseUrl and leading slash from path if needed
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanPath = resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`;

  return `${cleanBaseUrl}${cleanPath}`;
}

/**
 * Parse request body if it's valid JSON
 */
function parseBody(body: string | undefined): unknown {
  if (!body || body.trim() === '') {
    return undefined;
  }

  try {
    return JSON.parse(body);
  } catch {
    // Return as string if not valid JSON
    return body;
  }
}

/**
 * Apply authentication to headers and query params based on auth config
 */
function applyAuth(
  authConfig: AuthConfig,
  headers: Record<string, string>,
  queryParams: Record<string, string>,
): { headers: Record<string, string>; queryParams: Record<string, string> } {
  const newHeaders = { ...headers };
  const newQueryParams = { ...queryParams };

  switch (authConfig.type) {
    case 'bearer':
      if (authConfig.bearerToken) {
        newHeaders['Authorization'] = `Bearer ${authConfig.bearerToken}`;
      }
      break;

    case 'apiKey':
      if (authConfig.apiKeyName && authConfig.apiKeyValue) {
        if (authConfig.apiKeyLocation === 'query') {
          newQueryParams[authConfig.apiKeyName] = authConfig.apiKeyValue;
        } else {
          // Default to header
          newHeaders[authConfig.apiKeyName] = authConfig.apiKeyValue;
        }
      }
      break;

    case 'basic':
      if (authConfig.basicUsername) {
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

interface ExecuteRequestOptions extends ExecuteRequestParams {
  authConfig?: AuthConfig;
  customCookies?: CustomCookie[];
}

/**
 * Execute an API request via server proxy to avoid CORS issues
 */
export async function executeRequest(params: ExecuteRequestOptions): Promise<ExecuteRequestResult> {
  const {
    baseUrl,
    path,
    method,
    pathParams,
    queryParams,
    headers,
    body,
    authConfig,
    customCookies,
  } = params;

  const startTime = performance.now();

  try {
    const url = buildUrl(baseUrl, path, pathParams);
    const parsedBody = parseBody(body);

    // Filter out empty query params
    let filteredQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== ''),
    );

    // Filter out empty headers
    let filteredHeaders = Object.fromEntries(
      Object.entries(headers).filter(([_, value]) => value !== ''),
    );

    // Apply authentication if configured
    if (authConfig && authConfig.type !== 'none') {
      const authResult = applyAuth(authConfig, filteredHeaders, filteredQueryParams);
      filteredHeaders = authResult.headers;
      filteredQueryParams = authResult.queryParams;
    }

    // Apply custom cookies
    if (customCookies && customCookies.length > 0) {
      const enabledCookies = customCookies.filter((c) => c.enabled && c.name && c.value);
      if (enabledCookies.length > 0) {
        const cookieString = enabledCookies.map((c) => `${c.name}=${c.value}`).join('; ');
        // Append to existing Cookie header or create new one
        const existingCookie = filteredHeaders['Cookie'] || '';
        filteredHeaders['Cookie'] = existingCookie
          ? `${existingCookie}; ${cookieString}`
          : cookieString;
      }
    }

    const response = (await proxyApiRequest({
      data: {
        url,
        method,
        headers: filteredHeaders,
        queryParams: filteredQueryParams,
        body: parsedBody,
      },
    })) as ProxyResponse;

    return {
      success: true,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        duration: response.duration,
      },
      setCookies: response.setCookies,
    };
  } catch (error) {
    const duration = performance.now() - startTime;

    let errorMessage = 'Request failed';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      duration: Math.round(duration),
    };
  }
}

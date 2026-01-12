import type { ExecuteRequestParams, ExecuteRequestResult } from '../model/api-tester-types';
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
 * Execute an API request via server proxy to avoid CORS issues
 */
export async function executeRequest(params: ExecuteRequestParams): Promise<ExecuteRequestResult> {
  const { baseUrl, path, method, pathParams, queryParams, headers, body } = params;

  const startTime = performance.now();

  try {
    const url = buildUrl(baseUrl, path, pathParams);
    const parsedBody = parseBody(body);

    // Filter out empty query params
    const filteredQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== ''),
    );

    // Filter out empty headers
    const filteredHeaders = Object.fromEntries(
      Object.entries(headers).filter(([_, value]) => value !== ''),
    );

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

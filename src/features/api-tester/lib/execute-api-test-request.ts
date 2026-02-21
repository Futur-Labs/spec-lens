import { applyAuth } from './apply-auth';
import { buildExecuteUrl } from './build-execute-url';
import { parseBody } from './parse-body';
import type { ExecuteRequestOptions, ExecuteRequestResult } from '../model/api-tester-types';
import { proxyApiRequest } from '@/shared/server';

/**
 * Execute an API Test request via server proxy to avoid CORS issues
 */
export async function executeApiTestRequest(
  params: ExecuteRequestOptions,
): Promise<ExecuteRequestResult> {
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
    const url = buildExecuteUrl(baseUrl, path, pathParams);
    const contentType = headers?.['Content-Type'] || '';
    const parsedBody = parseBody(body, contentType);

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

    const response = await proxyApiRequest({
      data: {
        url,
        method,
        headers: filteredHeaders,
        queryParams: filteredQueryParams,
        body: parsedBody,
      },
    });

    return {
      success: true,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        duration: response.duration,
        size: response.size,
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

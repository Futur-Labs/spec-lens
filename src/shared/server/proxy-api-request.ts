import { createServerFn } from '@tanstack/react-start';
import axios, { type AxiosInstance, AxiosError } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

import { parseSetCookieHeader, type ParsedCookie } from './parse-set-cookie-header';
import { validateTargetUrl } from './validate-target-url';

type ProxyRequestParams = {
  url: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: unknown;
};

export type ResponseState = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
  size: number;
};

type ProxyResponse = ResponseState & {
  setCookies: ParsedCookie[];
};

export const proxyApiRequest = createServerFn({ method: 'POST' })
  .inputValidator((data: ProxyRequestParams) => data)
  .handler(async ({ data }): Promise<ProxyResponse> => {
    const { url, method, headers = {}, queryParams = {}, body } = data;
    const safeUrl = await validateTargetUrl(url);

    const startTime = performance.now();
    const cookieJar = new CookieJar();
    const axiosWithCookies: AxiosInstance = wrapper(axios.create({ jar: cookieJar }));

    try {
      const response = await axiosWithCookies({
        method,
        url: safeUrl.toString(),
        params: queryParams,
        headers: {
          ...headers,
          'User-Agent': 'SpecLens/1.0',
        },
        data: body,
        validateStatus: () => true,
        timeout: 30000,
      });

      const duration = performance.now() - startTime;

      // Convert headers to plain object
      const responseHeaders: Record<string, string> = {};
      const setCookies: ParsedCookie[] = [];

      if (response.headers && typeof response.headers === 'object') {
        Object.entries(response.headers as Record<string, unknown>).forEach(([key, value]) => {
          if (typeof value === 'string') {
            responseHeaders[key] = value;
            // Parse set-cookie header
            if (key.toLowerCase() === 'set-cookie') {
              const parsed = parseSetCookieHeader(value);
              if (parsed) setCookies.push(parsed);
            }
          } else if (Array.isArray(value)) {
            responseHeaders[key] = value.join(', ');
            // Parse multiple set-cookie headers
            if (key.toLowerCase() === 'set-cookie') {
              for (const cookieStr of value) {
                if (typeof cookieStr === 'string') {
                  const parsed = parseSetCookieHeader(cookieStr);
                  if (parsed) setCookies.push(parsed);
                }
              }
            }
          }
        });
      }

      // Calculate response size (Content-Length header first, fallback to body size)
      let size = 0;
      const contentLength = responseHeaders['content-length'];
      if (contentLength) {
        size = parseInt(contentLength, 10) || 0;
      } else {
        const data = response.data;
        if (data !== null && data !== undefined) {
          size =
            typeof data === 'string'
              ? new TextEncoder().encode(data).length
              : new TextEncoder().encode(JSON.stringify(data)).length;
        }
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: response.data,
        duration: Math.round(duration),
        size,
        setCookies,
      };
    } catch (err) {
      const duration = performance.now() - startTime;

      if (err instanceof AxiosError) {
        if (err.code === 'ECONNABORTED') {
          throw new Error('Request timed out');
        }
        if (err.code === 'ECONNREFUSED') {
          throw new Error('Failed to connect to the server');
        }
        if (err.response) {
          const errData = err.response.data;
          const errSize =
            errData !== null && errData !== undefined
              ? typeof errData === 'string'
                ? new TextEncoder().encode(errData).length
                : new TextEncoder().encode(JSON.stringify(errData)).length
              : 0;
          return {
            status: err.response.status,
            statusText: err.response.statusText,
            headers: {},
            data: errData,
            duration: Math.round(duration),
            size: errSize,
            setCookies: [],
          };
        }
        throw new Error(`Request failed: ${err.message}`);
      }

      if (err instanceof Error) {
        throw new Error(`Request failed: ${err.message}`);
      }

      throw new Error('Request failed');
    }
  });

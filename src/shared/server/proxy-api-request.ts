import { createServerFn } from '@tanstack/react-start';
import axios, { type AxiosInstance, AxiosError } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

// Module-level cookie jar to persist cookies across requests
const cookieJar = new CookieJar();
const axiosWithCookies: AxiosInstance = wrapper(axios.create({ jar: cookieJar }));

interface ProxyRequestParams {
  url: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: unknown;
}

export interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
}

export const proxyApiRequest = createServerFn({ method: 'POST' })
  .inputValidator((data: ProxyRequestParams) => data)
  .handler(async ({ data }): Promise<ProxyResponse> => {
    const { url, method, headers = {}, queryParams = {}, body } = data;

    const startTime = performance.now();

    try {
      const response = await axiosWithCookies({
        method,
        url,
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
      if (response.headers && typeof response.headers === 'object') {
        Object.entries(response.headers as Record<string, unknown>).forEach(([key, value]) => {
          if (typeof value === 'string') {
            responseHeaders[key] = value;
          } else if (Array.isArray(value)) {
            responseHeaders[key] = value.join(', ');
          }
        });
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: response.data,
        duration: Math.round(duration),
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
          return {
            status: err.response.status,
            statusText: err.response.statusText,
            headers: {},
            data: err.response.data,
            duration: Math.round(duration),
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

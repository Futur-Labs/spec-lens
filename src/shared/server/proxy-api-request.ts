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

export interface ParsedCookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
}

export interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
  setCookies: ParsedCookie[];
}

/**
 * Parse a Set-Cookie header string into a structured object
 */
function parseSetCookieHeader(setCookieHeader: string): ParsedCookie | null {
  const parts = setCookieHeader.split(';').map((p) => p.trim());
  if (parts.length === 0) return null;

  // First part is name=value
  const [firstPart, ...attributes] = parts;
  const eqIndex = firstPart.indexOf('=');
  if (eqIndex === -1) return null;

  const name = firstPart.substring(0, eqIndex);
  const value = firstPart.substring(eqIndex + 1);

  const cookie: ParsedCookie = { name, value };

  // Parse attributes
  for (const attr of attributes) {
    const attrLower = attr.toLowerCase();
    if (attrLower === 'httponly') {
      cookie.httpOnly = true;
    } else if (attrLower === 'secure') {
      cookie.secure = true;
    } else if (attrLower.startsWith('path=')) {
      cookie.path = attr.substring(5);
    } else if (attrLower.startsWith('domain=')) {
      cookie.domain = attr.substring(7);
    } else if (attrLower.startsWith('expires=')) {
      cookie.expires = attr.substring(8);
    } else if (attrLower.startsWith('samesite=')) {
      cookie.sameSite = attr.substring(9);
    }
  }

  return cookie;
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

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: response.data,
        duration: Math.round(duration),
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
          return {
            status: err.response.status,
            statusText: err.response.statusText,
            headers: {},
            data: err.response.data,
            duration: Math.round(duration),
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

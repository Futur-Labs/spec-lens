import { applyAuth } from './apply-auth';
import { buildExecuteUrl } from './build-execute-url';
import type { ApiAuthConfig } from '@/entities/api-auth';
import type { CustomCookie } from '@/entities/cookie';

function shellEscape(str: string): string {
  if (str === '') return "''";
  if (!/[^a-zA-Z0-9@%+=:,./-]/.test(str)) return str;
  return "'" + str.replace(/'/g, "'\\''") + "'";
}

export function generateCurlCommand({
  baseUrl,
  path,
  method,
  pathParams,
  queryParams,
  headers,
  body,
  authConfig,
  customCookies,
}: {
  baseUrl: string;
  path: string;
  method: string;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body: string;
  authConfig: ApiAuthConfig;
  customCookies: CustomCookie[];
}): string {
  const { headers: finalHeaders, queryParams: finalQueryParams } = applyAuth(
    authConfig,
    { ...headers },
    { ...queryParams },
  );

  // Build URL
  let url = buildExecuteUrl(baseUrl, path, pathParams);

  // Add query params
  const filteredQueryParams = Object.entries(finalQueryParams).filter(
    ([_, v]) => v !== undefined && v !== '',
  );
  if (filteredQueryParams.length > 0) {
    const searchParams = new URLSearchParams(filteredQueryParams);
    url += `?${searchParams.toString()}`;
  }

  const parts: string[] = ['curl'];

  // Method
  if (method.toUpperCase() !== 'GET') {
    parts.push(`-X ${method.toUpperCase()}`);
  }

  // URL
  parts.push(shellEscape(url));

  // Headers (exclude empty values and Content-Type for multipart)
  const filteredHeaders = Object.entries(finalHeaders).filter(([key, value]) => {
    if (!value) return false;
    // multipart/form-data는 curl이 boundary를 자동 생성하므로 제외
    if (key === 'Content-Type' && value.includes('multipart/form-data')) return false;
    return true;
  });

  for (const [key, value] of filteredHeaders) {
    parts.push(`-H ${shellEscape(`${key}: ${value}`)}`);
  }

  // Cookies
  const enabledCookies = customCookies.filter((c) => c.enabled);
  if (enabledCookies.length > 0) {
    const cookieString = enabledCookies.map((c) => `${c.name}=${c.value}`).join('; ');
    parts.push(`-b ${shellEscape(cookieString)}`);
  }

  // Body
  const contentType = finalHeaders['Content-Type'] || '';
  if (body && body.trim() !== '') {
    if (contentType.includes('multipart/form-data')) {
      // multipart: convert JSON fields to -F flags
      try {
        const parsed = JSON.parse(body) as Record<string, unknown>;
        for (const [key, value] of Object.entries(parsed)) {
          if (key === '__hasFiles') continue;
          if (typeof value === 'object' && value !== null) {
            // File field - mark as file reference
            parts.push(`-F ${shellEscape(`${key}=@file`)}`);
          } else {
            parts.push(`-F ${shellEscape(`${key}=${String(value)}`)}`);
          }
        }
      } catch {
        parts.push(`-d ${shellEscape(body)}`);
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const parsed = JSON.parse(body) as Record<string, unknown>;
        const formData = Object.entries(parsed)
          .filter(([_, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&');
        parts.push(`--data-urlencode ${shellEscape(formData)}`);
      } catch {
        parts.push(`-d ${shellEscape(body)}`);
      }
    } else {
      parts.push(`-d ${shellEscape(body)}`);
    }
  }

  return parts.join(' \\\n  ');
}

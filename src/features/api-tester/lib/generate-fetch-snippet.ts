import { applyAuth } from './apply-auth';
import { buildExecuteUrl } from './build-execute-url';
import type { SnippetParams } from './snippet-types';

export function generateFetchSnippet({
  baseUrl,
  path,
  method,
  pathParams,
  queryParams,
  headers,
  body,
  authConfig,
  customCookies,
}: SnippetParams): string {
  const { headers: finalHeaders, queryParams: finalQueryParams } = applyAuth(
    authConfig,
    { ...headers },
    { ...queryParams },
  );

  let url = buildExecuteUrl(baseUrl, path, pathParams);

  const filteredQueryParams = Object.entries(finalQueryParams).filter(
    ([_, v]) => v !== undefined && v !== '',
  );
  if (filteredQueryParams.length > 0) {
    const searchParams = new URLSearchParams(filteredQueryParams);
    url += `?${searchParams.toString()}`;
  }

  const lines: string[] = [];

  // Build options object
  const options: string[] = [];
  options.push(`  method: '${method.toUpperCase()}'`);

  // Headers
  const filteredHeaders = Object.entries(finalHeaders).filter(([_, value]) => !!value);
  if (filteredHeaders.length > 0) {
    const headerLines = filteredHeaders.map(([key, value]) => `    '${key}': '${value}'`);
    options.push(`  headers: {\n${headerLines.join(',\n')}\n  }`);
  }

  // Body
  const contentType = finalHeaders['Content-Type'] || '';
  if (body && body.trim() !== '') {
    if (contentType.includes('application/json')) {
      options.push(`  body: JSON.stringify(${body})`);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const parsed = JSON.parse(body) as Record<string, unknown>;
        const entries = Object.entries(parsed)
          .filter(([_, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `  ['${k}', '${String(v)}']`)
          .join(',\n');
        options.push(`  body: new URLSearchParams([\n${entries}\n  ])`);
      } catch {
        options.push(`  body: '${body.replace(/'/g, "\\'")}'`);
      }
    } else {
      options.push(`  body: '${body.replace(/'/g, "\\'")}'`);
    }
  }

  // Cookies (as Cookie header)
  const enabledCookies = customCookies.filter((c) => c.enabled);
  if (enabledCookies.length > 0 && !finalHeaders['Cookie']) {
    const cookieString = enabledCookies.map((c) => `${c.name}=${c.value}`).join('; ');
    if (filteredHeaders.length > 0) {
      // Already have headers, just note it
      options.push(`  credentials: 'include' // Cookie: ${cookieString}`);
    } else {
      options.push(`  headers: { 'Cookie': '${cookieString}' }`);
    }
  }

  lines.push(`const response = await fetch('${url}', {`);
  lines.push(options.join(',\n'));
  lines.push('});');
  lines.push('');
  lines.push('const data = await response.json();');
  lines.push('console.log(data);');

  return lines.join('\n');
}

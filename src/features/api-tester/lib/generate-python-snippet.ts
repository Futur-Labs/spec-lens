import { applyAuth } from './apply-auth';
import { buildExecuteUrl } from './build-execute-url';
import type { SnippetParams } from './snippet-types';

export function generatePythonSnippet({
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

  const url = buildExecuteUrl(baseUrl, path, pathParams);

  const lines: string[] = [];
  lines.push('import requests');
  lines.push('');

  // URL
  lines.push(`url = '${url}'`);

  // Query params
  const filteredQueryParams = Object.entries(finalQueryParams).filter(
    ([_, v]) => v !== undefined && v !== '',
  );
  if (filteredQueryParams.length > 0) {
    const paramLines = filteredQueryParams.map(([k, v]) => `    '${k}': '${v}'`);
    lines.push(`params = {\n${paramLines.join(',\n')}\n}`);
  }

  // Headers
  const filteredHeaders = Object.entries(finalHeaders).filter(([_, value]) => !!value);
  if (filteredHeaders.length > 0) {
    const headerLines = filteredHeaders.map(([k, v]) => `    '${k}': '${v}'`);
    lines.push(`headers = {\n${headerLines.join(',\n')}\n}`);
  }

  // Cookies
  const enabledCookies = customCookies.filter((c) => c.enabled);
  if (enabledCookies.length > 0) {
    const cookieLines = enabledCookies.map((c) => `    '${c.name}': '${c.value}'`);
    lines.push(`cookies = {\n${cookieLines.join(',\n')}\n}`);
  }

  // Body
  const contentType = finalHeaders['Content-Type'] || '';
  let bodyArg = '';
  if (body && body.trim() !== '') {
    if (contentType.includes('application/json')) {
      lines.push(`payload = ${body}`);
      bodyArg = 'json=payload';
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const parsed = JSON.parse(body) as Record<string, unknown>;
        const dataLines = Object.entries(parsed)
          .filter(([_, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `    '${k}': '${String(v)}'`);
        lines.push(`data = {\n${dataLines.join(',\n')}\n}`);
        bodyArg = 'data=data';
      } catch {
        lines.push(`data = '${body.replace(/'/g, "\\'")}'`);
        bodyArg = 'data=data';
      }
    } else {
      lines.push(`data = '${body.replace(/'/g, "\\'")}'`);
      bodyArg = 'data=data';
    }
  }

  // Build request call
  lines.push('');
  const args = [`'${url}'`];
  if (filteredQueryParams.length > 0) args.push('params=params');
  if (filteredHeaders.length > 0) args.push('headers=headers');
  if (enabledCookies.length > 0) args.push('cookies=cookies');
  if (bodyArg) args.push(bodyArg);

  const methodLower = method.toLowerCase();
  if (args.length <= 2) {
    lines.push(`response = requests.${methodLower}(${args.join(', ')})`);
  } else {
    lines.push(`response = requests.${methodLower}(`);
    lines.push(args.map((a) => `    ${a}`).join(',\n'));
    lines.push(')');
  }

  lines.push('');
  lines.push('print(response.status_code)');
  lines.push('print(response.json())');

  return lines.join('\n');
}

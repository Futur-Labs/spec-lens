/**
 * Parse request body based on content type.
 * - application/x-www-form-urlencoded: JSON string → URL encoded string
 * - application/json (or others): JSON parse, fallback to string
 */
export function parseBody(body: string | undefined, contentType?: string): unknown {
  if (!body || body.trim() === '') {
    return undefined;
  }

  // form-urlencoded: JSON 객체를 URL encoded string으로 변환
  if (contentType?.includes('application/x-www-form-urlencoded')) {
    try {
      const parsed = JSON.parse(body);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return Object.entries(parsed as Record<string, unknown>)
          .filter(([_, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&');
      }
    } catch {
      // 이미 URL encoded string일 수 있음
      return body;
    }
  }

  // multipart/form-data: JSON 객체 그대로 전달 (서버 프록시에서 처리)
  if (contentType?.includes('multipart/form-data')) {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  // JSON 또는 기타
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

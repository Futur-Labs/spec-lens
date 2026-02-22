import { parseUrlEncodedString } from './content-type';
import {
  type ApiSpec,
  type MediaTypeObject,
  type ParsedEndpoint,
  generateExample,
  getExampleFromMediaType,
  isReferenceObject,
} from '@/entities/api-spec';

export function getBodyExample(
  endpoint: ParsedEndpoint,
  spec: ApiSpec,
  contentType?: string,
): string {
  if (!endpoint.operation.requestBody || isReferenceObject(endpoint.operation.requestBody))
    return '';

  const content = endpoint.operation.requestBody.content;
  if (!content) return '';

  // 특정 content type이 지정된 경우 해당 타입에서만 추출
  if (contentType && content[contentType]) {
    return extractExample(content[contentType], spec, contentType);
  }

  // 기존 우선순위 로직 (하위 호환)
  const jsonContent = content['application/json'];
  if (jsonContent) {
    return extractExample(jsonContent, spec, 'application/json');
  }

  const formContentType =
    Object.keys(content).find((ct) => ct.includes('application/x-www-form-urlencoded')) ||
    Object.keys(content).find((ct) => ct.includes('multipart/form-data'));

  if (formContentType) {
    return extractExample(content[formContentType], spec, formContentType);
  }

  return '';
}

/** media type object에서 example 추출 */
function extractExample(
  mediaType: MediaTypeObject,
  spec: ApiSpec,
  contentType: string,
): string {
  const mediaTypeExample = getExampleFromMediaType(mediaType);

  // JSON 계열
  if (contentType.includes('application/json')) {
    if (mediaTypeExample !== null) {
      return typeof mediaTypeExample === 'string'
        ? mediaTypeExample
        : JSON.stringify(mediaTypeExample, null, 2);
    }
    if (mediaType.schema) {
      const generated = generateExample(mediaType.schema, spec);
      return generated ? JSON.stringify(generated, null, 2) : '';
    }
    return '';
  }

  // form 계열 (multipart, urlencoded 등)
  if (
    mediaTypeExample &&
    typeof mediaTypeExample === 'object' &&
    !Array.isArray(mediaTypeExample)
  ) {
    return JSON.stringify(mediaTypeExample, null, 2);
  }
  if (typeof mediaTypeExample === 'string') {
    const parsed = parseUrlEncodedString(mediaTypeExample);
    if (parsed) return JSON.stringify(parsed, null, 2);
  }

  if (mediaType.schema) {
    const generated = generateExample(mediaType.schema, spec);
    if (generated && typeof generated === 'object' && !Array.isArray(generated)) {
      const stringified: Record<string, string> = {};
      for (const [key, value] of Object.entries(generated as Record<string, unknown>)) {
        stringified[key] = value != null ? String(value) : '';
      }
      return JSON.stringify(stringified, null, 2);
    }
  }

  return '';
}

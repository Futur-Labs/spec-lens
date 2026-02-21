import { parseUrlEncodedString } from './content-type';
import {
  type ApiSpec,
  type ParsedEndpoint,
  generateExample,
  getExampleFromMediaType,
  isReferenceObject,
} from '@/entities/api-spec';

export function getBodyExample(endpoint: ParsedEndpoint, spec: ApiSpec): string {
  if (!endpoint.operation.requestBody || isReferenceObject(endpoint.operation.requestBody))
    return '';

  const content = endpoint.operation.requestBody.content;
  if (!content) return '';

  // JSON content type
  const jsonContent = content['application/json'];
  if (jsonContent) {
    const mediaTypeExample = getExampleFromMediaType(jsonContent);
    if (mediaTypeExample !== null) {
      return typeof mediaTypeExample === 'string'
        ? mediaTypeExample
        : JSON.stringify(mediaTypeExample, null, 2);
    }

    if (jsonContent.schema) {
      const generated = generateExample(jsonContent.schema, spec);
      return generated ? JSON.stringify(generated, null, 2) : '';
    }
  }

  // form-urlencoded / multipart → schema에서 key-value 추출하여 JSON string으로
  const formContentType =
    Object.keys(content).find((ct) => ct.includes('application/x-www-form-urlencoded')) ||
    Object.keys(content).find((ct) => ct.includes('multipart/form-data'));

  if (formContentType) {
    const formContent = content[formContentType];
    const mediaTypeExample = getExampleFromMediaType(formContent);
    if (
      mediaTypeExample &&
      typeof mediaTypeExample === 'object' &&
      !Array.isArray(mediaTypeExample)
    ) {
      return JSON.stringify(mediaTypeExample, null, 2);
    }
    // URL-encoded string example (e.g. "key1=val1&key2=val2")
    if (typeof mediaTypeExample === 'string') {
      const parsed = parseUrlEncodedString(mediaTypeExample);
      if (parsed) return JSON.stringify(parsed, null, 2);
    }

    if (formContent.schema) {
      const generated = generateExample(formContent.schema, spec);
      if (generated && typeof generated === 'object' && !Array.isArray(generated)) {
        // string 값으로 변환
        const stringified: Record<string, string> = {};
        for (const [key, value] of Object.entries(generated as Record<string, unknown>)) {
          stringified[key] = value != null ? String(value) : '';
        }
        return JSON.stringify(stringified, null, 2);
      }
    }
  }

  return '';
}

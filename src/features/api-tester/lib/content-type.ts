import {
  type ApiSpec,
  type ParsedEndpoint,
  type SchemaObject,
  generateExample,
  getExampleFromMediaType,
  isReferenceObject,
  resolveSchema,
} from '@/entities/api-spec';

export type ContentTypeCategory = 'json' | 'form' | 'multipart' | 'other';

export interface FormField {
  name: string;
  type: string;
  format?: string;
  required: boolean;
  description: string;
  example: string;
  multiple?: boolean;
}

/** URL-encoded string (e.g. "key1=val1&key2=val2")을 Record로 파싱 */
export function parseUrlEncodedString(str: string): Record<string, string> | null {
  if (!str.includes('=')) return null;
  const pairs = str.split('&');
  const result: Record<string, string> = {};
  for (const pair of pairs) {
    const eqIndex = pair.indexOf('=');
    if (eqIndex > 0) {
      const key = decodeURIComponent(pair.slice(0, eqIndex));
      const value = decodeURIComponent(pair.slice(eqIndex + 1));
      result[key] = value;
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

/** endpoint에서 사용 가능한 content type 목록 반환 */
export function getAvailableContentTypes(endpoint: ParsedEndpoint): string[] {
  const rb = endpoint.operation.requestBody;
  if (!rb || isReferenceObject(rb) || !rb.content) return [];
  return Object.keys(rb.content);
}

/** content type 문자열로 카테고리 판별 */
export function getCategoryFromContentType(contentType: string): ContentTypeCategory {
  if (!contentType) return 'json';
  if (contentType.includes('application/json')) return 'json';
  if (contentType.includes('multipart/form-data')) return 'multipart';
  if (contentType.includes('application/x-www-form-urlencoded')) return 'form';
  return 'other';
}

export function getContentTypeCategory(endpoint: ParsedEndpoint): ContentTypeCategory {
  const contentTypes = getAvailableContentTypes(endpoint);
  if (contentTypes.length === 0) return 'json';

  // json 우선 체크
  if (contentTypes.some((ct) => ct.includes('application/json'))) return 'json';
  if (contentTypes.some((ct) => ct.includes('multipart/form-data'))) return 'multipart';
  if (contentTypes.some((ct) => ct.includes('application/x-www-form-urlencoded'))) return 'form';

  return 'other';
}

export function getFormFields(
  endpoint: ParsedEndpoint,
  spec: ApiSpec,
  contentType?: string,
): FormField[] {
  const rb = endpoint.operation.requestBody;
  if (!rb || isReferenceObject(rb) || !rb.content) return [];

  // 선택된 content type이 있으면 해당 타입 사용, 없으면 기존 우선순위
  const ct = contentType
    ? contentType
    : Object.keys(rb.content).find((t) => t.includes('multipart/form-data')) ||
      Object.keys(rb.content).find((t) => t.includes('application/x-www-form-urlencoded')) ||
      Object.keys(rb.content)[0];

  if (!ct || !rb.content[ct]) return [];

  const mediaType = rb.content[ct];

  // 먼저 example/examples에서 추출 시도
  const mediaExample = getExampleFromMediaType(mediaType);

  // example을 object로 변환 (URL-encoded string 파싱 포함)
  let exampleObj: Record<string, unknown> | null = null;
  if (mediaExample && typeof mediaExample === 'object' && !Array.isArray(mediaExample)) {
    exampleObj = mediaExample as Record<string, unknown>;
  } else if (typeof mediaExample === 'string') {
    exampleObj = parseUrlEncodedString(mediaExample);
  }

  if (exampleObj) {
    const required =
      (mediaType.schema && !isReferenceObject(mediaType.schema)
        ? (mediaType.schema as SchemaObject).required
        : undefined) || [];
    const schema = mediaType.schema ? resolveSchema(mediaType.schema, spec) : null;

    return Object.entries(exampleObj).map(([key, value]) => {
      const propSchema = schema?.properties?.[key]
        ? resolveSchema(schema.properties[key], spec)
        : null;

      return {
        name: key,
        type: propSchema?.type || typeof value,
        format: propSchema?.format,
        required: required.includes(key),
        description: propSchema?.description || '',
        example: value != null ? String(value) : '',
      };
    });
  }

  // schema.properties에서 추출
  if (!mediaType.schema) return [];
  const schema = resolveSchema(mediaType.schema, spec);
  if (!schema?.properties) return [];

  const required = schema.required || [];

  return Object.entries(schema.properties).map(([key, propSchemaOrRef]) => {
    const propSchema = resolveSchema(propSchemaOrRef, spec);
    const example = generateExample(propSchemaOrRef, spec);

    // array of binary files 감지
    const isArrayBinary =
      propSchema?.type === 'array' &&
      propSchema.items &&
      !isReferenceObject(propSchema.items) &&
      (propSchema.items as SchemaObject).format === 'binary';

    return {
      name: key,
      type: propSchema?.type || 'string',
      format: isArrayBinary ? 'binary' : propSchema?.format,
      required: required.includes(key),
      description: propSchema?.description || '',
      example: example != null ? String(example) : '',
      multiple: isArrayBinary || undefined,
    };
  });
}

export function getFormDefaultValues(
  endpoint: ParsedEndpoint,
  spec: ApiSpec,
): Record<string, string> {
  const fields = getFormFields(endpoint, spec);
  const values: Record<string, string> = {};
  for (const field of fields) {
    if (field.example) {
      values[field.name] = field.example;
    }
  }
  return values;
}

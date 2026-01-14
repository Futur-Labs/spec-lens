import {
  type OpenAPISpec,
  type SchemaObject,
  type ReferenceObject,
  type ParsedEndpoint,
  isReferenceObject,
} from '../model/openapi-types.ts';

/**
 * Resolve a $ref reference to its actual schema
 */
export function resolveRef<T>(ref: string, spec: OpenAPISpec): T | null {
  // Format: #/components/schemas/SchemaName
  const parts = ref.replace('#/', '').split('/');

  let current: unknown = spec;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }

  return current as T;
}

/**
 * Resolve schema, following $ref if needed
 */
export function resolveSchema(
  schemaOrRef: SchemaObject | ReferenceObject | undefined,
  spec: OpenAPISpec,
): SchemaObject | null {
  if (!schemaOrRef) return null;

  if (isReferenceObject(schemaOrRef)) {
    return resolveRef<SchemaObject>(schemaOrRef.$ref, spec);
  }

  return schemaOrRef;
}

/**
 * Get parameters for an endpoint, merging path-level and operation-level
 */
export function getMergedParameters(endpoint: ParsedEndpoint) {
  const pathParams = endpoint.pathItem.parameters || [];
  const operationParams = endpoint.operation.parameters || [];

  // Operation params override path params with same name+in
  const paramMap = new Map<string, (typeof pathParams)[0]>();

  for (const param of pathParams) {
    if (!isReferenceObject(param)) {
      paramMap.set(`${param.in}:${param.name}`, param);
    }
  }

  for (const param of operationParams) {
    if (!isReferenceObject(param)) {
      paramMap.set(`${param.in}:${param.name}`, param);
    }
  }

  return Array.from(paramMap.values());
}

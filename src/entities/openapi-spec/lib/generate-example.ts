import { resolveSchema } from './resolve-schema.ts';
import {
  type OpenAPISpec,
  type SchemaObject,
  type ReferenceObject,
  type MediaTypeObject,
  type ExampleObject,
  type ParameterObject,
} from '../model/openapi-types.ts';

/**
 * recursively generate example value from schema
 */
export function generateExample(
  schemaOrRef: SchemaObject | ReferenceObject | undefined,
  spec: OpenAPISpec,
  depth = 0,
): unknown {
  if (!schemaOrRef) return null;

  // Prevent infinite recursion
  if (depth > 5) return null;

  const schema = resolveSchema(schemaOrRef, spec);
  if (!schema) return null;

  // 1. Use explicit example/default if present
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;

  // 2. Generate based on type
  switch (schema.type) {
    case 'object': {
      const obj: Record<string, unknown> = {};
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          obj[key] = generateExample(propSchema, spec, depth + 1);
        }
      }
      return obj;
    }

    case 'array':
      if (schema.items) {
        // Return array with one example item
        return [generateExample(schema.items, spec, depth + 1)];
      }
      return [];

    case 'string':
      if (schema.enum && schema.enum.length > 0) return schema.enum[0];
      if (schema.format === 'date') return '2024-01-01';
      if (schema.format === 'date-time') return '2024-01-01T12:00:00Z';
      if (schema.format === 'email') return 'user@example.com';
      if (schema.format === 'uri') return 'https://example.com';
      if (schema.format === 'uuid') return '3fa85f64-5717-4562-b3fc-2c963f66afa6';
      return 'string';

    case 'integer':
    case 'number':
      return 0;

    case 'boolean':
      return true;

    default:
      return null;
  }
}

/**
 * Legacy wrapper for backward compatibility if needed, though we should migrate usage.
 */
export function getSchemaExample(schema: SchemaObject): unknown {
  // Simple non-recursive fallback for legacy calls without spec

  return generateExample(schema, { openapi: '3.0.0', info: {} as any, paths: {} });
}

/**
 * Extract example value from MediaTypeObject
 * Priority: example (singular) > first value from examples (plural)
 * If examples value is a JSON string, parse it
 */
export function getExampleFromMediaType(mediaType: MediaTypeObject | undefined): unknown {
  if (!mediaType) return null;

  // 1. Use example (singular) first
  if (mediaType.example !== undefined) {
    return mediaType.example;
  }

  // 2. Use first value from examples (plural)
  if (mediaType.examples) {
    const exampleKeys = Object.keys(mediaType.examples);
    if (exampleKeys.length > 0) {
      const firstExample = mediaType.examples[exampleKeys[0]];

      // Skip if ReferenceObject (could be extended to resolve refs if needed)
      if (firstExample && '$ref' in firstExample) {
        return null;
      }

      const exampleObj = firstExample as ExampleObject;
      if (exampleObj.value !== undefined) {
        // Try to parse if value is a JSON string
        if (typeof exampleObj.value === 'string') {
          try {
            return JSON.parse(exampleObj.value);
          } catch {
            // Return original string if parse fails
            return exampleObj.value;
          }
        }
        return exampleObj.value;
      }
    }
  }

  return null;
}

/**
 * Extract example value from ParameterObject
 * Priority: example (singular) > first value from examples (plural) > content example
 * If examples value is a JSON string, parse it
 */
export function getExampleFromParameter(param: ParameterObject | undefined): unknown {
  if (!param) return null;

  // 1. Use example (singular) first
  if (param.example !== undefined) {
    return param.example;
  }

  // 2. Use first value from examples (plural)
  if (param.examples) {
    const exampleKeys = Object.keys(param.examples);
    if (exampleKeys.length > 0) {
      const firstExample = param.examples[exampleKeys[0]];

      // Skip if ReferenceObject
      if (firstExample && '$ref' in firstExample) {
        return null;
      }

      const exampleObj = firstExample as ExampleObject;
      if (exampleObj.value !== undefined) {
        // Try to parse if value is a JSON string
        if (typeof exampleObj.value === 'string') {
          try {
            return JSON.parse(exampleObj.value);
          } catch {
            return exampleObj.value;
          }
        }
        return exampleObj.value;
      }
    }
  }

  // 3. Check content (for parameters with complex types)
  if (param.content) {
    const mediaType = param.content['application/json'] || Object.values(param.content)[0];
    if (mediaType) {
      return getExampleFromMediaType(mediaType);
    }
  }

  return null;
}

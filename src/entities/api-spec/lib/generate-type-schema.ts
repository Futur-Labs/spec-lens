import { resolveSchema } from './resolve-schema.ts';
import {
  type ApiSpec,
  type SchemaObject,
  type ReferenceObject,
  isReferenceObject,
} from '../model/api-types.ts';

export function generateTypeSchema(
  schemaOrRef: SchemaObject | ReferenceObject | undefined,
  spec: ApiSpec,
  depth = 0,
): unknown {
  if (!schemaOrRef) return null;
  if (depth > 5) return null;

  const schema = isReferenceObject(schemaOrRef) ? resolveSchema(schemaOrRef, spec) : schemaOrRef;
  if (!schema) return null;

  switch (schema.type) {
    case 'object': {
      const obj: Record<string, unknown> = {};
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          obj[key] = generateTypeSchema(propSchema, spec, depth + 1);
        }
      }
      return obj;
    }

    case 'array':
      if (schema.items) {
        return [generateTypeSchema(schema.items, spec, depth + 1)];
      }
      return [];

    case 'string':
      if (schema.enum && schema.enum.length > 0) {
        return `enum(${schema.enum.join('|')})`;
      }
      if (schema.format) return `string(${schema.format})`;
      return 'string';

    case 'integer':
      return 'integer';

    case 'number':
      return 'number';

    case 'boolean':
      return 'boolean';

    default:
      return 'any';
  }
}

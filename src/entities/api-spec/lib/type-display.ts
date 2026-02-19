import { resolveSchema } from './resolve-schema';
import { isReferenceObject, type ApiSpec, type SchemaObject } from '../model/api-types';

export function getTypeDisplay(schema: SchemaObject | null, spec: ApiSpec): string {
  if (!schema) {
    return 'any';
  }

  if (schema.type === 'array' && schema.items) {
    const itemSchema = isReferenceObject(schema.items)
      ? resolveSchema(schema.items, spec)
      : schema.items;

    if (itemSchema) {
      return `array<${getTypeDisplay(itemSchema, spec)}>`;
    }

    return 'array';
  }

  if (schema.enum) {
    return `enum`;
  }

  return schema.type || 'any';
}

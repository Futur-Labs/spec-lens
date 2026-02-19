import type { SchemaObject } from '../model/api-types';

export function hasChildrenCondition(schema: SchemaObject | null) {
  return (
    schema?.type === 'object' ||
    schema?.type === 'array' ||
    schema?.allOf ||
    schema?.oneOf ||
    schema?.anyOf
  );
}

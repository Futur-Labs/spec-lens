// Store & Actions
export { specStoreActions, useSpecStore } from './model/spec-store.ts';

// Selector hooks
export { useSpec, useSpecSource, useEndpoints, useTags } from './model/spec-store.ts';
export { useIsLoading, useError, useIsRefreshing } from './model/spec-store.ts';
export { useSpecStoreHydration } from './model/spec-store.ts';

// Types
export type { SpecSource } from './model/spec-types.ts';
export type {
  OpenAPISpec,
  ParsedEndpoint,
  ParameterObject,
  ResponseObject,
  SchemaObject,
  ReferenceObject,
  MediaTypeObject,
  RequestBodyObject,
} from './model/openapi-types.ts';
export { isReferenceObject } from './model/openapi-types.ts';

// Lib - parsing
export { parseEndpoints, groupEndpointsByTag, getAllTags } from './lib/parse-endpoints.ts';
export { filterEndpoints } from './lib/filter-endpoints.ts';

// Lib - schema resolution
export { resolveRef, resolveSchema, getMergedParameters } from './lib/resolve-schema.ts';

// Lib - example generation
export {
  generateExample,
  getSchemaExample,
  getExampleFromMediaType,
  getExampleFromParameter,
} from './lib/generate-example.ts';

// Lib - validation
export { validateOpenAPISpec } from './lib/validate-spec.ts';

// Lib - method color
export { getMethodColor } from './lib/method-color.ts';

// UI Components
export { MethodBadge } from './ui/method-badge.tsx';
export { SchemaViewer } from './ui/schema-viewer.tsx';

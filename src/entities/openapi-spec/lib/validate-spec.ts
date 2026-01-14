/**
 * Validate if the given object is a valid OpenAPI 3.x spec
 */
export function validateOpenAPISpec(obj: unknown): { valid: boolean; error?: string } {
  if (!obj || typeof obj !== 'object') {
    return { valid: false, error: 'Invalid JSON object' };
  }

  const spec = obj as Record<string, unknown>;

  if (!spec.openapi || typeof spec.openapi !== 'string') {
    return { valid: false, error: 'Missing or invalid "openapi" field' };
  }

  if (!spec.openapi.startsWith('3.')) {
    return {
      valid: false,
      error: `Unsupported OpenAPI version: ${spec.openapi}. Only 3.x is supported.`,
    };
  }

  if (!spec.info || typeof spec.info !== 'object') {
    return { valid: false, error: 'Missing or invalid "info" object' };
  }

  if (!spec.paths || typeof spec.paths !== 'object') {
    return { valid: false, error: 'Missing or invalid "paths" object' };
  }

  return { valid: true };
}

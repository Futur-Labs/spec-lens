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

  const content = endpoint.operation.requestBody.content?.['application/json'];
  if (content) {
    const mediaTypeExample = getExampleFromMediaType(content);
    if (mediaTypeExample !== null) {
      return typeof mediaTypeExample === 'string'
        ? mediaTypeExample
        : JSON.stringify(mediaTypeExample, null, 2);
    }

    if (content.schema) {
      const generated = generateExample(content.schema, spec);
      return generated ? JSON.stringify(generated, null, 2) : '';
    }
  }
  return '';
}

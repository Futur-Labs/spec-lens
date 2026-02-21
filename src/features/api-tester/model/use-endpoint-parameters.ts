import {
  type ParameterObject,
  type ParsedEndpoint,
  getMergedParameters,
  isReferenceObject,
} from '@/entities/api-spec';

export function useEndpointParameters(endpoint: ParsedEndpoint) {
  const merged = getMergedParameters(endpoint);
  const parameters = merged.filter((p): p is ParameterObject => !isReferenceObject(p));
  console.log(endpoint.operation.requestBody);

  return {
    pathParameters: parameters.filter((p) => p.in === 'path'),
    queryParameters: parameters.filter((p) => p.in === 'query'),
    hasRequestBody: !!endpoint.operation.requestBody,
  };
}

import { useEffect } from 'react';

import { type ParsedEndpoint, useSpecSource } from '@/entities/api-spec';
import {
  testParamsStoreActions,
  useHeaders,
  usePathParams,
  useQueryParams,
  useRequestBody,
  useResponse,
  useSelectedServer,
} from '@/entities/test-params';

export function useAutoSaveParams(endpoint: ParsedEndpoint) {
  const specSource = useSpecSource();
  const specSourceId = specSource?.name || 'default';

  const selectedServer = useSelectedServer();
  const pathParams = usePathParams();
  const queryParams = useQueryParams();
  const headers = useHeaders();
  const requestBody = useRequestBody();
  const response = useResponse();

  useEffect(() => {
    const endpointKey = `${endpoint.method}:${endpoint.path}`;

    const timeoutId = setTimeout(() => {
      testParamsStoreActions.saveCurrentParams(specSourceId, endpointKey);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    pathParams,
    queryParams,
    headers,
    requestBody,
    response,
    selectedServer,
    endpoint.method,
    endpoint.path,
    specSourceId,
  ]);
}

import { useEffect, useRef } from 'react';

import {
  type ParameterObject,
  type ParsedEndpoint,
  getExampleFromParameter,
  getMergedParameters,
  isReferenceObject,
  useSpecSource,
} from '@/entities/api-spec';
import { testParamsStoreActions } from '@/entities/test-params';

export function useEndpointParamsSync(endpoint: ParsedEndpoint, bodyExample: string) {
  const specSource = useSpecSource();
  const specSourceId = specSource?.name || 'default';

  const prevEndpointRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);
  const bodyExampleRef = useRef(bodyExample);

  useEffect(() => {
    bodyExampleRef.current = bodyExample;
  }, [bodyExample]);

  useEffect(() => {
    const currentEndpointKey = `${endpoint.method}:${endpoint.path}`;

    if (
      !isInitialMount.current &&
      prevEndpointRef.current &&
      prevEndpointRef.current !== currentEndpointKey
    ) {
      testParamsStoreActions.saveCurrentParams(specSourceId, prevEndpointRef.current);
    }

    const hasData = testParamsStoreActions.loadSavedParams(specSourceId, currentEndpointKey);

    if (!hasData) {
      testParamsStoreActions.resetParams();
      if (bodyExampleRef.current) testParamsStoreActions.setRequestBody(bodyExampleRef.current);

      // Set Content-Type from endpoint's requestBody content
      const requestBody = endpoint.operation.requestBody;
      if (requestBody && !isReferenceObject(requestBody) && requestBody.content) {
        const contentTypes = Object.keys(requestBody.content);
        if (contentTypes.length > 0) {
          const ct = contentTypes.find((t) => t.includes('application/json')) || contentTypes[0];
          testParamsStoreActions.setHeader('Content-Type', ct);
        }
      }

      const merged = getMergedParameters(endpoint);
      const params = merged.filter((p): p is ParameterObject => !isReferenceObject(p));
      for (const param of params) {
        const example = getExampleFromParameter(param);
        if (example !== null) {
          const exampleStr = typeof example === 'string' ? example : String(example);
          if (param.in === 'path') {
            testParamsStoreActions.setPathParam(param.name, exampleStr);
          } else if (param.in === 'query') {
            testParamsStoreActions.setQueryParam(param.name, exampleStr);
          }
        }
      }
    }

    prevEndpointRef.current = currentEndpointKey;
    isInitialMount.current = false;
  }, [endpoint.path, endpoint.method, specSourceId, endpoint]);

  const handleClearCurrent = () => {
    const endpointKey = `${endpoint.method}:${endpoint.path}`;
    testParamsStoreActions.clearEndpointParams(specSourceId, endpointKey);
    if (bodyExample) testParamsStoreActions.setRequestBody(bodyExample);

    const requestBody = endpoint.operation.requestBody;
    if (requestBody && !isReferenceObject(requestBody) && requestBody.content) {
      const contentTypes = Object.keys(requestBody.content);
      if (contentTypes.length > 0) {
        const ct = contentTypes.find((t) => t.includes('application/json')) || contentTypes[0];
        testParamsStoreActions.setHeader('Content-Type', ct);
      }
    }
  };

  return { handleClearCurrent };
}

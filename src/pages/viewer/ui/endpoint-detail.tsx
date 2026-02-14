import { useEffect, useRef } from 'react';

import { EndpointDetailHeader } from './endpoint-detail-header';
import { EndpointParametersSection } from './endpoint-parameters-section';
import { EndpointRequestBodySection } from './endpoint-request-body-section';
import { EndpointResponsesSection } from './endpoint-responses-section';
import {
  type ParameterObject,
  type ParsedEndpoint,
  getMergedParameters,
  isReferenceObject,
  useSpec,
} from '@/entities/api-spec';
import { TryItPanel } from '@/features/api-tester';

export function EndpointDetail({ endpoint }: { endpoint: ParsedEndpoint }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { operation, path, method } = endpoint;
  const spec = useSpec();

  // Scroll to top when endpoint changes
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [path, method]);

  // Get merged parameters
  const allParams = getMergedParameters(endpoint);
  const parameters = allParams.filter((p): p is ParameterObject => !isReferenceObject(p));

  // Get request body schema
  const requestBody = operation.requestBody;
  const requestBodyContent =
    requestBody && !isReferenceObject(requestBody)
      ? requestBody.content?.['application/json']
      : null;

  if (!spec) return null;

  return (
    <div
      ref={containerRef}
      style={{
        padding: '2.4rem',
        maxWidth: '90rem',
      }}
    >
      <EndpointDetailHeader method={method} path={path} operation={operation} />

      <EndpointParametersSection parameters={parameters} spec={spec} />

      <EndpointRequestBodySection requestBodyContent={requestBodyContent} spec={spec} />

      <EndpointResponsesSection responses={operation.responses} spec={spec} />

      <TryItPanel endpoint={endpoint} spec={spec} />
    </div>
  );
}

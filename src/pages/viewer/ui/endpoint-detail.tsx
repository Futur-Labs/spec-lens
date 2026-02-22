import { useEffect, useEffectEvent, useRef } from 'react';

import { EndpointDetailHeader } from './endpoint-detail-header';
import { EndpointParametersSection } from './endpoint-parameters-section';
import { EndpointRequestBodySection } from './endpoint-request-body-section';
import { EndpointResponsesSection } from './endpoint-responses-section';
import { type ParsedEndpoint, useSpec } from '@/entities/api-spec';
import { TryItPanel } from '@/features/api-tester';

export function EndpointDetail({ endpoint }: { endpoint: ParsedEndpoint }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { operation, path, method } = endpoint;
  const spec = useSpec();

  const endpointKey = `${method}:${path}`;

  const scrollToTop = useEffectEvent(() => {
    containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });

  useEffect(() => {
    scrollToTop();
  }, [endpointKey]);

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

      <EndpointParametersSection endpoint={endpoint} spec={spec} />

      <EndpointRequestBodySection requestBody={operation.requestBody} spec={spec} />

      <EndpointResponsesSection responses={operation.responses} spec={spec} />

      <TryItPanel endpoint={endpoint} spec={spec} />
    </div>
  );
}

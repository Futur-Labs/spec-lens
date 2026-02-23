import { useEffect, useEffectEvent, useRef } from 'react';

import { Webhook } from 'lucide-react';

import { EndpointDetailHeader } from './endpoint-detail-header';
import { EndpointRequestBodySection } from './endpoint-request-body-section';
import { EndpointResponsesSection } from './endpoint-responses-section';
import {
  type OperationObject,
  type SelectedWebhook,
  useSpec,
} from '@/entities/api-spec';
import type { HttpMethod } from '@/shared/type';

export function WebhookDetail({ webhook }: { webhook: SelectedWebhook }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spec = useSpec();

  const webhookKey = `${webhook.method}:${webhook.name}`;

  const scrollToTop = useEffectEvent(() => {
    containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });

  useEffect(() => {
    scrollToTop();
  }, [webhookKey]);

  if (!spec?.webhooks) return null;

  const pathItem = spec.webhooks[webhook.name];
  if (!pathItem) return null;

  const operation = pathItem[webhook.method] as OperationObject | undefined;
  if (!operation) return null;

  return (
    <div
      ref={containerRef}
      style={{
        padding: '2.4rem',
        maxWidth: '90rem',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.8rem',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          borderRadius: '0.4rem',
          marginBottom: '1.2rem',
          color: '#a78bfa',
          fontSize: '1.1rem',
          fontWeight: 500,
        }}
      >
        <Webhook size={12} />
        Webhook
      </div>

      <EndpointDetailHeader
        method={webhook.method as HttpMethod}
        path={webhook.name}
        operation={operation}
      />

      <EndpointRequestBodySection requestBody={operation.requestBody} spec={spec} />

      <EndpointResponsesSection responses={operation.responses} spec={spec} />
    </div>
  );
}

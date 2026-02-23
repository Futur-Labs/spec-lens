import { useEffect } from 'react';

import { EndpointDetail } from './endpoint-detail.tsx';
import { EndpointPlaceholder } from './endpoint-placeholder.tsx';
import { WebhookDetail } from './webhook-detail.tsx';
import { useSelectedWebhook } from '@/entities/api-spec';
import { diffModeActions, SpecDiffPanel, useIsDiffMode } from '@/features/spec-diff';
import { useSelectedEndpointItem } from '@/features/spec-refresh/index.ts';

export function EndpointContent() {
  const { selectedEndpoint } = useSelectedEndpointItem();
  const selectedWebhook = useSelectedWebhook();
  const isDiffMode = useIsDiffMode();

  useEffect(() => {
    if ((selectedEndpoint || selectedWebhook) && isDiffMode) {
      diffModeActions.closeDiffMode();
    }
  }, [selectedEndpoint, selectedWebhook]);

  if (isDiffMode) {
    return (
      <div style={{ padding: '2.4rem', maxWidth: '90rem' }}>
        <SpecDiffPanel />
      </div>
    );
  }

  if (selectedWebhook) return <WebhookDetail webhook={selectedWebhook} />;

  if (!selectedEndpoint) return <EndpointPlaceholder />;

  return <EndpointDetail endpoint={selectedEndpoint} />;
}

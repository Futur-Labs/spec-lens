import { EndpointDetail } from './endpoint-detail.tsx';
import { EndpointPlaceholder } from './endpoint-placeholder.tsx';
import { useSelectedEndpointItem } from '@/features/spec-refresh/index.ts';

export function EndpointContent() {
  const { selectedEndpoint } = useSelectedEndpointItem();

  if (!selectedEndpoint) return <EndpointPlaceholder />;

  return <EndpointDetail endpoint={selectedEndpoint} />;
}

import { useSelectedEndpoint, useSpecStore } from '@/entities/api-spec';

export function useSelectedEndpointItem() {
  const selectedEndpointKey = useSelectedEndpoint();
  const endpoints = useSpecStore((s) => s.endpoints);

  const selectedEndpoint = selectedEndpointKey
    ? (endpoints.find(
        (e) => e.path === selectedEndpointKey.path && e.method === selectedEndpointKey.method,
      ) ?? null)
    : null;

  return {
    selectedEndpoint,
  };
}

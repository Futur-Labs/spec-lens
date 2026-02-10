import { useEffect } from 'react';

import { generateEndpointHash } from '../lib/generate-endpoint-hash';
import { endpointSelectionStoreActions } from '@/entities/endpoint-selection';
import { sidebarStoreActions, useExpandedTags } from '@/entities/openapi-sidebar';
import { useSpecStore } from '@/entities/openapi-spec';

export function useRestoreEndpointFromHash() {
  const endpoints = useSpecStore((s) => s.endpoints);
  const expandedTags = useExpandedTags();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!endpoints.length || !hash) return;

    const matchingEndpoint = endpoints.find((ep) => {
      const epHash = generateEndpointHash(ep.method, ep.path);
      return epHash === hash;
    });

    if (matchingEndpoint) {
      endpointSelectionStoreActions.selectEndpoint(matchingEndpoint.path, matchingEndpoint.method);

      // Expand the tag containing this endpoint
      const endpointTag = matchingEndpoint.operation.tags?.[0] || 'default';
      if (!expandedTags.includes(endpointTag)) {
        sidebarStoreActions.toggleTagExpanded(endpointTag);
      }
    }
  }, [endpoints, expandedTags]);
}

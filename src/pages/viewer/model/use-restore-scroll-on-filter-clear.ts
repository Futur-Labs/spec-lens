import type { Virtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';

import {
  type EndpointFlatItem,
  useSelectedEndpoint,
  useSelectedMethods,
  useSelectedTags,
} from '@/entities/api-spec';

export function useRestoreScrollOnFilterClear(
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  flatItems: EndpointFlatItem[],
) {
  const selectedEndpoint = useSelectedEndpoint();
  const selectedMethods = useSelectedMethods();
  const selectedTags = useSelectedTags();

  const hasActiveFilters = selectedMethods.length > 0 || selectedTags.length > 0;
  const prevHadFilters = useRef(hasActiveFilters);

  useEffect(() => {
    const wasFiltered = prevHadFilters.current;
    prevHadFilters.current = hasActiveFilters;

    if (!wasFiltered || hasActiveFilters) return;
    if (!selectedEndpoint) return;

    const index = flatItems.findIndex(
      (item) =>
        item.type === 'endpoint' &&
        item.endpoint.method === selectedEndpoint.method &&
        item.endpoint.path === selectedEndpoint.path,
    );

    if (index === -1) return;

    const timeoutId = setTimeout(() => {
      virtualizer.scrollToIndex(index, { align: 'center' });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [hasActiveFilters, flatItems, selectedEndpoint, virtualizer]);
}

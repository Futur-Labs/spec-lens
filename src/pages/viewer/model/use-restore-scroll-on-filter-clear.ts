import type { Virtualizer } from '@tanstack/react-virtual';
import { useEffectEvent, useLayoutEffect, useRef } from 'react';

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

  const scrollToSelected = useEffectEvent(() => {
    if (!selectedEndpoint) return;

    const index = flatItems.findIndex(
      (item) =>
        item.type === 'endpoint' &&
        item.endpoint.method === selectedEndpoint.method &&
        item.endpoint.path === selectedEndpoint.path,
    );

    if (index === -1) return;

    virtualizer.scrollToIndex(index, { align: 'center', behavior: 'auto' });
  });

  useLayoutEffect(() => {
    const wasFiltered = prevHadFilters.current;
    prevHadFilters.current = hasActiveFilters;

    if (!wasFiltered || hasActiveFilters) return;

    scrollToSelected();
  }, [hasActiveFilters]);
}

import { useMemo } from 'react';

import { filterEndpoints } from '../lib/filter-endpoints';
import {
  useSearchQuery,
  useSelectedMethods,
  useSelectedTags,
  groupEndpointsByTag,
  useSpecStore,
  type EndpointFlatItem,
} from '@/entities/api-spec';
import { useExpandedTags } from '@/entities/sidebar';
import { useDebounceDeferredValue } from '@/shared/hooks';

export function useFlatEndpointItems() {
  const searchQuery = useSearchQuery();
  const selectedTags = useSelectedTags();
  const selectedMethods = useSelectedMethods();
  const endpoints = useSpecStore((s) => s.endpoints);
  const expandedTags = useExpandedTags();

  const deferredSearchQuery = useDebounceDeferredValue(searchQuery, 150, {
    immediateOnEmpty: true,
  });

  const hasSearchQuery = deferredSearchQuery.trim().length > 0;

  const filteredEndpoints = filterEndpoints(endpoints, {
    searchQuery: deferredSearchQuery,
    selectedTags,
    selectedMethods,
  });

  const endpointsByTag = groupEndpointsByTag(filteredEndpoints);
  const tagEntries = Object.entries(endpointsByTag);

  const flatItems = useMemo<EndpointFlatItem[]>(() => {
    const items: EndpointFlatItem[] = [];

    for (const [tag, tagEndpoints] of tagEntries) {
      const isExpanded = hasSearchQuery || expandedTags.includes(tag);
      items.push({ type: 'header', tag, count: tagEndpoints.length, isExpanded });
      if (isExpanded) {
        for (const endpoint of tagEndpoints) {
          items.push({ type: 'endpoint', endpoint });
        }
      }
    }

    return items;
  }, [tagEntries, expandedTags, hasSearchQuery]);

  return {
    flatItems,
  };
}

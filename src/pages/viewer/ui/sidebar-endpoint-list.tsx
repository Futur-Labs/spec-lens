import { useVirtualizer } from '@tanstack/react-virtual';
import { useDeferredValue, useMemo, useRef } from 'react';

import { SidebarEndpointGroupHeader } from './sidebar-endpoint-group-header';
import { SidebarEndpointItem } from './sidebar-endpoint-item';
import { useRestoreEndpointFromHash } from '../model/use-restore-endpoint-from-hash';
import { useScrollToSelectedEndpoint } from '../model/use-scroll-to-selected-endpoint';
import { useSearchQuery, useSelectedMethods, useSelectedTags } from '@/entities/endpoint-filter';
import { useExpandedTags } from '@/entities/openapi-sidebar';
import {
  filterEndpoints,
  groupEndpointsByTag,
  useSpecStore,
  type EndpointFlatItem,
} from '@/entities/openapi-spec';
import { useColors } from '@/shared/theme';

const TAG_HEADER_HEIGHT = 40;
const ENDPOINT_ITEM_HEIGHT = 36;

export function SidebarEndpointList() {
  'use no memo';

  const colors = useColors();
  const searchQuery = useSearchQuery();
  const selectedTags = useSelectedTags();
  const selectedMethods = useSelectedMethods();
  const endpoints = useSpecStore((s) => s.endpoints);
  const expandedTags = useExpandedTags();

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredEndpoints = filterEndpoints(endpoints, {
    searchQuery: deferredSearchQuery,
    selectedTags,
    selectedMethods,
  });
  const endpointsByTag = groupEndpointsByTag(filteredEndpoints);
  const tagEntries = Object.entries(endpointsByTag);

  const endpointRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const parentRef = useRef<HTMLDivElement>(null);

  useRestoreEndpointFromHash();
  useScrollToSelectedEndpoint(endpointRefs);

  const flatItems = useMemo<EndpointFlatItem[]>(() => {
    const items: EndpointFlatItem[] = [];

    for (const [tag, tagEndpoints] of tagEntries) {
      const isExpanded = expandedTags.includes(tag);
      items.push({ type: 'header', tag, count: tagEndpoints.length, isExpanded });
      if (isExpanded) {
        for (const endpoint of tagEndpoints) {
          items.push({ type: 'endpoint', endpoint });
        }
      }
    }

    return items;
  }, [tagEntries, expandedTags]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) =>
      flatItems[index].type === 'header' ? TAG_HEADER_HEIGHT : ENDPOINT_ITEM_HEIGHT,
    overscan: 20,
    useFlushSync: false,
  });

  if (tagEntries.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          padding: '3.2rem 1.6rem',
          textAlign: 'center',
          color: colors.text.tertiary,
          fontSize: '1.3rem',
        }}
      >
        No endpoints found
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.8rem 0',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = flatItems[virtualRow.index];

          if (item.type === 'header') {
            return (
              <div
                key={`header-${item.tag}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <SidebarEndpointGroupHeader endpointHeaderItem={item} />
              </div>
            );
          }

          return (
            <div
              key={`${item.endpoint.method}-${item.endpoint.path}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <SidebarEndpointItem endpointRefs={endpointRefs} endpoint={item.endpoint} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

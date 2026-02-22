import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import { SidebarEndpointGroupHeader } from './sidebar-endpoint-group-header';
import { SidebarEndpointItem } from './sidebar-endpoint-item';
import { calcInitialEndpointOffset } from '../lib/initial-scroll-to-endpoint';
import { useRestoreScrollOnFilterClear } from '../model/use-restore-scroll-on-filter-clear';
import { useScrollToSelectedEndpoint } from '../model/use-scroll-to-selected-endpoint';
import type { EndpointFlatItem } from '@/entities/api-spec';
import { useVirtualSmoothScroll } from '@/shared/lib';

const TAG_HEADER_HEIGHT = 40;
const ENDPOINT_ITEM_HEIGHT = 36;
const ESTIMATED_CONTAINER_HEIGHT = 600;

export function VirtualizedEndpointList({ flatItems }: { flatItems: EndpointFlatItem[] }) {
  'use no memo';

  const endpointRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const parentRef = useRef<HTMLDivElement>(null);

  const scrollToFn = useVirtualSmoothScroll(parentRef);
  const initialOffset = calcInitialEndpointOffset(flatItems, ESTIMATED_CONTAINER_HEIGHT);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) =>
      flatItems[index].type === 'header' ? TAG_HEADER_HEIGHT : ENDPOINT_ITEM_HEIGHT,
    overscan: 20,
    useFlushSync: false,
    scrollToFn,
    initialOffset,
  });

  useScrollToSelectedEndpoint(endpointRefs);
  useRestoreScrollOnFilterClear(virtualizer, flatItems);

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

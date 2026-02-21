import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import { SidebarEndpointGroupHeader } from './sidebar-endpoint-group-header.tsx';
import { SidebarEndpointItem } from './sidebar-endpoint-item.tsx';
import { generateEndpointHash } from '../lib/generate-endpoint-hash.ts';
import { calcInitialEndpointOffset } from '../lib/initial-scroll-to-endpoint.ts';
import { useFlatEndpointItems } from '../model/use-flat-endpoint-items.ts';
import { useRestoreEndpointFromHash } from '../model/use-restore-endpoint-from-hash.ts';
import { useScrollToSelectedEndpoint } from '../model/use-scroll-to-selected-endpoint.ts';
import { type EndpointFlatItem, useSpecStore } from '@/entities/api-spec';
import { useVirtualSmoothScroll } from '@/shared/lib';
import { useColors } from '@/shared/theme';

const TAG_HEADER_HEIGHT = 40;
const ENDPOINT_ITEM_HEIGHT = 36;
const ESTIMATED_CONTAINER_HEIGHT = 600;

export function SidebarEndpointList() {
  const colors = useColors();
  const { flatItems } = useFlatEndpointItems();
  const endpoints = useSpecStore((s) => s.endpoints);

  useRestoreEndpointFromHash();

  if (flatItems.length === 0) {
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

  const hash = window.location.hash.slice(1);
  if (hash) {
    const hashMatchesEndpoint = endpoints.some(
      (ep) => generateEndpointHash(ep.method, ep.path) === hash,
    );
    const hashTargetInList = flatItems.some(
      (item) =>
        item.type === 'endpoint' &&
        generateEndpointHash(item.endpoint.method, item.endpoint.path) === hash,
    );
    if (hashMatchesEndpoint && !hashTargetInList) {
      return <div style={{ flex: 1 }} />;
    }
  }

  return <VirtualizedEndpointList flatItems={flatItems} />;
}

function VirtualizedEndpointList({ flatItems }: { flatItems: EndpointFlatItem[] }) {
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

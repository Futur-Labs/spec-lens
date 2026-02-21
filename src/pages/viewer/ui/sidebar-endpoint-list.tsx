import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import { SidebarEndpointGroupHeader } from './sidebar-endpoint-group-header';
import { SidebarEndpointItem } from './sidebar-endpoint-item';
import { useFlatEndpointItems } from '../model/use-flat-endpoint-items';
import { useInitialScrollToEndpoint } from '../model/use-initial-scroll-to-endpoint';
import { useRestoreEndpointFromHash } from '../model/use-restore-endpoint-from-hash';
import { useScrollToSelectedEndpoint } from '../model/use-scroll-to-selected-endpoint';
import { useVirtualSmoothScroll } from '@/shared/lib';
import { useColors } from '@/shared/theme';

const TAG_HEADER_HEIGHT = 40;
const ENDPOINT_ITEM_HEIGHT = 36;

export function SidebarEndpointList() {
  'use no memo';

  const colors = useColors();
  const endpointRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const parentRef = useRef<HTMLDivElement>(null);

  const { flatItems } = useFlatEndpointItems();

  const scrollToFn = useVirtualSmoothScroll(parentRef);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) =>
      flatItems[index].type === 'header' ? TAG_HEADER_HEIGHT : ENDPOINT_ITEM_HEIGHT,
    overscan: 20,
    useFlushSync: false,
    scrollToFn,
  });

  useRestoreEndpointFromHash();
  useScrollToSelectedEndpoint(endpointRefs);
  useInitialScrollToEndpoint(virtualizer, flatItems);

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

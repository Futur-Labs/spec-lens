import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { useDeferredValue, useMemo, useRef } from 'react';

import { ChevronRight } from 'lucide-react';

import { SidebarEndpointItem } from './sidebar-endpoint-item';
import { useRestoreEndpointFromHash } from '../model/use-restore-endpoint-from-hash';
import { useScrollToSelectedEndpoint } from '../model/use-scroll-to-selected-endpoint';
import { useSearchQuery, useSelectedMethods, useSelectedTags } from '@/entities/endpoint-filter';
import { sidebarStoreActions, useExpandedTags } from '@/entities/openapi-sidebar';
import {
  filterEndpoints,
  groupEndpointsByTag,
  useSpecStore,
  type ParsedEndpoint,
} from '@/entities/openapi-spec';

type FlatItem =
  | { type: 'header'; tag: string; count: number; isExpanded: boolean }
  | { type: 'endpoint'; endpoint: ParsedEndpoint };

const TAG_HEADER_HEIGHT = 40;
const ENDPOINT_ITEM_HEIGHT = 36;

export function SidebarEndpointList() {
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

  // 플랫 리스트 생성
  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
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

  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) =>
      flatItems[index].type === 'header' ? TAG_HEADER_HEIGHT : ENDPOINT_ITEM_HEIGHT,
    overscan: 10,
    useFlushSync: false,
  });

  if (tagEntries.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          padding: '3.2rem 1.6rem',
          textAlign: 'center',
          color: '#6b7280',
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
                <button
                  onClick={() => sidebarStoreActions.toggleTagExpanded(item.tag)}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '0 1.6rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: item.isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ChevronRight size={14} color='#6b7280' />
                  </motion.div>
                  <span
                    style={{
                      color: '#9ca3af',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {item.tag}
                  </span>
                  <span
                    style={{
                      color: '#9ca3af',
                      fontSize: '1.2rem',
                      marginLeft: 'auto',
                      fontWeight: 500,
                    }}
                  >
                    {item.count}
                  </span>
                </button>
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

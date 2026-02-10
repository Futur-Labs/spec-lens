import { AnimatePresence, motion } from 'framer-motion';
import { useDeferredValue, useRef } from 'react';

import { ChevronRight } from 'lucide-react';

import { SidebarEndpointItem } from './sidebar-endpoint-item';
import { useRestoreEndpointFromHash } from '../model/use-restore-endpoint-from-hash';
import { useScrollToSelectedEndpoint } from '../model/use-scroll-to-selected-endpoint';
import { useSearchQuery, useSelectedMethods, useSelectedTags } from '@/entities/endpoint-filter';
import { sidebarStoreActions, useExpandedTags } from '@/entities/openapi-sidebar';
import { filterEndpoints, groupEndpointsByTag, useSpecStore } from '@/entities/openapi-spec';

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

  useRestoreEndpointFromHash();
  useScrollToSelectedEndpoint(endpointRefs);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.8rem 0',
      }}
    >
      {tagEntries.length === 0 ? (
        <div
          style={{
            padding: '3.2rem 1.6rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '1.3rem',
          }}
        >
          No endpoints found
        </div>
      ) : (
        tagEntries.map(([tag, endpoints]) => {
          const isExpanded = expandedTags.includes(tag);

          return (
            <div key={tag} style={{ marginBottom: '0.4rem' }}>
              {/* Tag Header */}
              <button
                onClick={() => sidebarStoreActions.toggleTagExpanded(tag)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '1rem 1.6rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isExpanded ? 90 : 0 }}
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
                  {tag}
                </span>
                <span
                  style={{
                    color: '#9ca3af',
                    fontSize: '1.2rem',
                    marginLeft: 'auto',
                    fontWeight: 500,
                  }}
                >
                  {endpoints.length}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    {endpoints.map((endpoint) => {
                      return (
                        <SidebarEndpointItem
                          key={endpoint.path + endpoint.method}
                          endpointRefs={endpointRefs}
                          endpoint={endpoint}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
}

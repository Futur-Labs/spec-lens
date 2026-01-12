import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ChevronRight, Search, X } from 'lucide-react';

import {
  MethodBadge,
  openAPIStoreActions,
  useExpandedTags,
  useIsSidebarOpen,
  useOpenAPIStore,
  useSearchQuery,
  useSelectedEndpoint,
} from '@/entities/openapi';
import { Tooltip } from '@/shared/ui/tooltip';

export function Sidebar() {
  const spec = useOpenAPIStore((s) => s.spec);
  const searchQuery = useSearchQuery();
  const selectedEndpoint = useSelectedEndpoint();
  const expandedTags = useExpandedTags();
  const isSidebarOpen = useIsSidebarOpen();

  // Use MotionValue for performance (no re-renders on drag)
  const sidebarWidth = useMotionValue(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const endpointsByTag = openAPIStoreActions.getEndpointsByTag();
  const tagEntries = Object.entries(endpointsByTag);

  const startResizing = useCallback(() => {
    setIsResizing(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth >= 240 && newWidth <= 800) {
          sidebarWidth.set(newWidth);
        }
      }
    },
    [isResizing, sidebarWidth],
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  if (!spec) return null;

  return (
    <AnimatePresence mode='wait'>
      {isSidebarOpen && (
        <motion.aside
          ref={sidebarRef}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: sidebarWidth.get() || 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{
            width: { duration: isResizing ? 0 : 0.3, ease: 'easeInOut' },
            opacity: { duration: 0.2 },
          }}
          style={{
            width: sidebarWidth, // Bind MotionValue directly
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#161616',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.6rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ marginBottom: '1.2rem' }}>
              <h2
                style={{
                  color: '#e5e5e5',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                {spec.info.title}
              </h2>
              <span style={{ color: '#6b7280', fontSize: '1.2rem' }}>
                v{spec.info.version} • OpenAPI {spec.openapi}
              </span>
            </div>

            {/* Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.8rem 1.2rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '0.6rem',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Search size={14} color='#6b7280' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => openAPIStoreActions.setSearchQuery(e.target.value)}
                placeholder='Search endpoints...'
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#e5e5e5',
                  fontSize: '1.3rem',
                }}
              />
              {searchQuery && (
                <button
                  onClick={openAPIStoreActions.clearFilters}
                  style={{
                    padding: '0.2rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} color='#6b7280' />
                </button>
              )}
            </div>
          </div>

          {/* Endpoint List */}
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
                      onClick={() => openAPIStoreActions.toggleTagExpanded(tag)}
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
                          color: '#4b5563',
                          fontSize: '1.1rem',
                          marginLeft: 'auto',
                        }}
                      >
                        {endpoints.length}
                      </span>
                    </button>

                    {/* Endpoints */}
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
                            const isSelected =
                              selectedEndpoint?.path === endpoint.path &&
                              selectedEndpoint?.method === endpoint.method;

                            return (
                              <Tooltip
                                key={`${endpoint.method}-${endpoint.path}`}
                                content={endpoint.path}
                                placement='right'
                                delay={800}
                                fullWidth
                              >
                                <motion.button
                                  onClick={() =>
                                    openAPIStoreActions.selectEndpoint(
                                      endpoint.path,
                                      endpoint.method,
                                    )
                                  }
                                  initial={false}
                                  animate={{
                                    backgroundColor: isSelected
                                      ? 'rgba(16, 185, 129, 0.15)'
                                      : 'transparent',
                                    borderLeftColor: isSelected ? '#10b981' : 'transparent',
                                    paddingLeft: isSelected ? '3.6rem' : '3.2rem',
                                  }}
                                  transition={{ duration: 0.2 }}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.8rem 1.6rem 0.8rem 3.2rem',
                                    border: 'none',
                                    borderLeftWidth: '3px',
                                    borderLeftStyle: 'solid',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    position: 'relative',
                                  }}
                                  whileHover={{
                                    backgroundColor: isSelected
                                      ? 'rgba(16, 185, 129, 0.35)'
                                      : 'rgba(255,255,255,0.1)',
                                  }}
                                >
                                  <MethodBadge method={endpoint.method} size='sm' />
                                  <span
                                    style={{
                                      color: isSelected ? '#ffffff' : '#9ca3af',
                                      fontSize: '1.3rem',
                                      fontFamily: 'monospace',
                                      fontWeight: isSelected ? 600 : 400,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {endpoint.path}
                                  </span>
                                </motion.button>
                              </Tooltip>
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

          {/* Resizer Handle */}
          <div
            onMouseDown={startResizing}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '4px',
              cursor: 'col-resize',
              backgroundColor: isResizing ? '#10b981' : 'transparent',
              transition: 'background-color 0.2s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              if (!isResizing) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

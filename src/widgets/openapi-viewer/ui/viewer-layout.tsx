import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';

import { Menu, X, Upload, RefreshCw, Loader2, Link, FileJson } from 'lucide-react';

import { EndpointDetail } from './endpoint-detail.tsx';
import { Sidebar } from './sidebar.tsx';
import {
  openAPIStoreActions,
  useOpenAPIStore,
  useSpec,
  useIsSidebarOpen,
  useSelectedEndpoint,
  useIsRefreshing,
  type OpenAPISpec,
  validateOpenAPISpec,
} from '@/entities/openapi';
import { GlobalAuthPanel } from '@/features/api-tester';
import { checkSpecUpdate } from '@/shared/server/fetch-external-spec';

export function ViewerLayout() {
  const navigate = useNavigate();
  const spec = useSpec();
  const isSidebarOpen = useIsSidebarOpen();
  const selectedEndpointKey = useSelectedEndpoint();
  const endpoints = useOpenAPIStore((s) => s.endpoints);
  const specSource = useOpenAPIStore((s) => s.specSource);
  const isRefreshing = useIsRefreshing();

  // Clear spec and navigate back to spec loader
  const handleClearSpec = () => {
    openAPIStoreActions.clearSpec();
    navigate({ to: '/', replace: true });
  };

  // Refresh spec from URL (only for URL sources)
  const handleRefreshSpec = async () => {
    if (!specSource || specSource.type !== 'url') return;

    openAPIStoreActions.setRefreshing(true);
    openAPIStoreActions.setRefreshError(null);

    try {
      const result = await checkSpecUpdate({
        data: {
          url: specSource.name,
          etag: specSource.etag || undefined,
          lastModified: specSource.lastModified || undefined,
        },
      });

      if (result.hasUpdate && result.data) {
        // Validate the new spec
        const validation = validateOpenAPISpec(result.data);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Update the spec with new data
        openAPIStoreActions.setSpec(result.data as OpenAPISpec, {
          type: 'url',
          name: specSource.name,
          etag: result.newEtag,
          lastModified: result.newLastModified,
        });
      } else {
        // No update available - just update the refresh time
        openAPIStoreActions.updateSpecSource({
          etag: result.newEtag || specSource.etag,
          lastModified: result.newLastModified || specSource.lastModified,
        });
      }

      openAPIStoreActions.setRefreshing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh spec';
      openAPIStoreActions.setRefreshError(message);
    }
  };

  // Check if refresh is available (only for URL sources)
  const canRefresh = specSource?.type === 'url';

  // Find the selected endpoint data
  const selectedEndpoint = selectedEndpointKey
    ? (endpoints.find(
        (e) => e.path === selectedEndpointKey.path && e.method === selectedEndpointKey.method,
      ) ?? null)
    : null;

  if (!spec) return null;

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Mobile Header */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.6rem',
          backgroundColor: '#111111',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 100,
        }}
        className='mobile-only'
      >
        <button
          onClick={openAPIStoreActions.toggleSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.8rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isSidebarOpen ? <X size={24} color='#e5e5e5' /> : <Menu size={24} color='#e5e5e5' />}
        </button>
        <span style={{ color: '#e5e5e5', fontSize: '1.4rem', fontWeight: 600 }}>
          {spec.info.title}
        </span>
        <button
          onClick={handleClearSpec}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.8rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={20} color='#6b7280' />
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#0a0a0a',
        }}
      >
        {/* Desktop Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.2rem 2.4rem',
            backgroundColor: '#111111',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <button
              onClick={openAPIStoreActions.toggleSidebar}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.8rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.6rem',
                cursor: 'pointer',
              }}
            >
              {isSidebarOpen ? <X size={18} color='#9ca3af' /> : <Menu size={18} color='#9ca3af' />}
            </button>
            <div>
              <h1
                style={{
                  color: '#e5e5e5',
                  fontSize: '1.6rem',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {spec.info.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ color: '#6b7280', fontSize: '1.2rem' }}>v{spec.info.version}</span>
                {specSource && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.2rem 0.6rem',
                      backgroundColor:
                        specSource.type === 'url'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(139, 92, 246, 0.15)',
                      borderRadius: '0.4rem',
                      fontSize: '1.1rem',
                      color: specSource.type === 'url' ? '#60a5fa' : '#a78bfa',
                    }}
                  >
                    {specSource.type === 'url' ? <Link size={10} /> : <FileJson size={10} />}
                    {specSource.type === 'url' ? 'URL' : 'File'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {canRefresh && (
              <button
                onClick={handleRefreshSpec}
                disabled={isRefreshing}
                title={isRefreshing ? 'Refreshing...' : 'Refresh spec from URL'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.8rem 1.2rem',
                  backgroundColor: isRefreshing
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.6rem',
                  color: isRefreshing ? '#6b7280' : '#9ca3af',
                  fontSize: '1.3rem',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isRefreshing ? 0.7 : 1,
                }}
              >
                <AnimatePresence mode='wait'>
                  {isRefreshing ? (
                    <motion.div
                      key='loader'
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Loader2 size={14} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key='refresh'
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <RefreshCw size={14} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span>{isRefreshing ? 'Refreshing' : 'Refresh'}</span>
              </button>
            )}
            <button
              onClick={handleClearSpec}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.8rem 1.4rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.6rem',
                color: '#9ca3af',
                fontSize: '1.3rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Upload size={14} />
              <span>Change Spec</span>
            </button>
          </div>
        </header>

        {/* Global Auth Panel */}
        <GlobalAuthPanel />

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {selectedEndpoint ? (
            <EndpointDetail endpoint={selectedEndpoint} spec={spec} />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '3.2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '6.4rem',
          height: '6.4rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.6rem',
        }}
      >
        <Menu size={24} color='#6b7280' />
      </div>
      <h2
        style={{
          color: '#e5e5e5',
          fontSize: '1.8rem',
          fontWeight: 600,
          marginBottom: '0.8rem',
        }}
      >
        Select an endpoint
      </h2>
      <p style={{ color: '#6b7280', fontSize: '1.4rem', maxWidth: '300px' }}>
        Choose an endpoint from the sidebar to view its documentation and test the API.
      </p>
    </div>
  );
}

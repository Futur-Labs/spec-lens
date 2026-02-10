import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { Menu, X, Upload, RefreshCw, Link, FileJson } from 'lucide-react';

import { EndpointDetail } from './endpoint-detail.tsx';
import { Sidebar } from './sidebar.tsx';
import { useSelectedEndpoint } from '@/entities/endpoint-selection';
import { sidebarStoreActions, useIsSidebarOpen } from '@/entities/openapi-sidebar';
import {
  specStoreActions,
  useSpecStore,
  useSpec,
  type OpenAPISpec,
  validateOpenAPISpec,
} from '@/entities/openapi-spec';
import { GlobalAuthPanel } from '@/features/api-tester';
import { checkSpecUpdate } from '@/shared/server';

export function ViewerLayout() {
  const navigate = useNavigate();
  const spec = useSpec();
  const isSidebarOpen = useIsSidebarOpen();
  const selectedEndpointKey = useSelectedEndpoint();
  const endpoints = useSpecStore((s) => s.endpoints);
  const specSource = useSpecStore((s) => s.specSource);

  // Clear spec and navigate back to spec loader
  const handleClearSpec = () => {
    specStoreActions.clearSpec();
    navigate({ to: '/', replace: true });
  };

  // Local state for spinning animation
  const [isSpinning, setIsSpinning] = useState(false);

  // Refresh spec from URL (only for URL sources)
  const handleRefreshSpec = async () => {
    if (!specSource || specSource.type !== 'url') return;
    if (isSpinning) return; // Prevent double-click

    // Start loading state
    setIsSpinning(true);
    specStoreActions.setRefreshing(true);
    specStoreActions.setRefreshError(null);

    const MIN_SPIN_DURATION = 800; // Minimum spin time for UX
    const startTime = Date.now();

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
        specStoreActions.setSpec(result.data as OpenAPISpec, {
          type: 'url',
          name: specSource.name,
          etag: result.newEtag,
          lastModified: result.newLastModified,
        });
      } else {
        // No update available - just update the refresh time
        specStoreActions.updateSpecSource({
          etag: result.newEtag || specSource.etag,
          lastModified: result.newLastModified || specSource.lastModified,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh spec';
      specStoreActions.setRefreshError(message);
    } finally {
      // Ensure minimum spin duration for smooth UX
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_SPIN_DURATION - elapsed);

      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      setIsSpinning(false);
      specStoreActions.setRefreshing(false);
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
          height: '5.6rem',
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
        <motion.button
          onClick={sidebarStoreActions.toggleSidebar}
          whileHover={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            scale: 1.05,
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.8rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0.6rem',
            cursor: 'pointer',
          }}
        >
          {isSidebarOpen ? <X size={24} color='#e5e5e5' /> : <Menu size={24} color='#e5e5e5' />}
        </motion.button>
        <span style={{ color: '#e5e5e5', fontSize: '1.4rem', fontWeight: 600 }}>
          {spec.info.title}
        </span>
        <motion.button
          onClick={handleClearSpec}
          whileHover={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            scale: 1.05,
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.8rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0.6rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={20} color='#6b7280' />
        </motion.button>
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
            <motion.button
              onClick={sidebarStoreActions.toggleSidebar}
              whileHover={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.2)',
                scale: 1.02,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
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
            </motion.button>
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
              <motion.button
                layout
                onClick={handleRefreshSpec}
                disabled={isSpinning}
                whileHover={
                  isSpinning
                    ? {}
                    : {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderColor: 'rgba(255,255,255,0.2)',
                        scale: 1.02,
                      }
                }
                whileTap={isSpinning ? {} : { scale: 0.98 }}
                transition={{
                  layout: { duration: 0.2, ease: 'easeOut' },
                  default: { duration: 0.15 },
                }}
                title={isSpinning ? 'Refreshing...' : 'Refresh spec from URL'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '0.8rem 1.4rem',
                  backgroundColor: isSpinning ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.6rem',
                  color: isSpinning ? '#6b7280' : '#e5e5e5',
                  fontSize: '1.3rem',
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  layout='position'
                  animate={{ rotate: isSpinning ? 360 : 0 }}
                  transition={{
                    rotate: {
                      duration: isSpinning ? 1 : 0,
                      repeat: isSpinning ? Infinity : 0,
                      ease: 'linear',
                    },
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RefreshCw size={14} />
                </motion.div>
                <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                  {isSpinning ? 'Refreshing' : 'Refresh'}
                </span>
              </motion.button>
            )}
            <motion.button
              onClick={handleClearSpec}
              whileHover={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.2)',
                scale: 1.02,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.8rem 1.4rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.6rem',
                color: '#e5e5e5',
                fontSize: '1.3rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <Upload size={14} />
              <span>Change Spec</span>
            </motion.button>
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
      <p style={{ color: '#6b7280', fontSize: '1.4rem', maxWidth: '30rem' }}>
        Choose an endpoint from the sidebar to view its documentation and test the API.
      </p>
    </div>
  );
}

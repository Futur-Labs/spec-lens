import { useNavigate } from '@tanstack/react-router';

import { Menu, X, Upload, RefreshCw } from 'lucide-react';

import { EndpointDetail } from './endpoint-detail.tsx';
import { Sidebar } from './sidebar.tsx';
import {
  openAPIStoreActions,
  useOpenAPIStore,
  useSpec,
  useIsSidebarOpen,
  useSelectedEndpoint,
} from '@/entities/openapi';
import { GlobalAuthPanel } from '@/features/api-tester';

export function ViewerLayout() {
  const navigate = useNavigate();
  const spec = useSpec();
  const isSidebarOpen = useIsSidebarOpen();
  const selectedEndpointKey = useSelectedEndpoint();
  const endpoints = useOpenAPIStore((s) => s.endpoints);

  // Clear spec and navigate back to spec loader
  const handleClearSpec = () => {
    openAPIStoreActions.clearSpec();
    navigate({ to: '/', replace: true });
  };

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
              <span style={{ color: '#6b7280', fontSize: '1.2rem' }}>v{spec.info.version}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
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

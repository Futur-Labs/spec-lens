import { EndpointDetail } from './endpoint-detail.tsx';
import { EndpointPlaceholder } from './endpoint-placeholder.tsx';
import { Sidebar } from './sidebar.tsx';
import { ViewerToolbar } from './viewer-toolbar.tsx';
import { useSelectedEndpoint } from '@/entities/endpoint-selection';
import { useSpecStore } from '@/entities/openapi-spec';
import { GlobalAuthPanel } from '@/features/api-tester';
import { useColors } from '@/shared/theme';

export function ViewerLayout() {
  const colors = useColors();

  const selectedEndpointKey = useSelectedEndpoint();
  const endpoints = useSpecStore((s) => s.endpoints);

  const selectedEndpoint = selectedEndpointKey
    ? (endpoints.find(
        (e) => e.path === selectedEndpointKey.path && e.method === selectedEndpointKey.method,
      ) ?? null)
    : null;

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: colors.bg.base,
        }}
      >
        <ViewerToolbar />
        <GlobalAuthPanel />

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {selectedEndpoint ? (
            <EndpointDetail endpoint={selectedEndpoint} />
          ) : (
            <EndpointPlaceholder />
          )}
        </div>
      </main>
    </div>
  );
}

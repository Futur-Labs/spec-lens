import { EndpointContent } from './endpoint-content.tsx';
import { Sidebar } from './sidebar.tsx';
import { ViewerToolbar } from './viewer-toolbar.tsx';
import { ApiSettingsModalTrigger } from '@/features/api-tester';
import { useColors } from '@/shared/theme';

export function ViewerLayout() {
  const colors = useColors();

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Sidebar />

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
        <ApiSettingsModalTrigger />

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <EndpointContent />
        </div>
      </main>
    </div>
  );
}

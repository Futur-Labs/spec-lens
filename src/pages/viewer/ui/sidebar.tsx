import { useState } from 'react';

import { ResizableSidebarLayout } from './resizable-sidebar-layout';
import { SidebarEndpointList } from './sidebar-endpoint-list';
import { SidebarHeader } from './sidebar-header';
import { SidebarModelsList } from './sidebar-models-list';
import { useSpec } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

type SidebarTab = 'endpoints' | 'models';

export function Sidebar() {
  const colors = useColors();
  const spec = useSpec();
  const [activeTab, setActiveTab] = useState<SidebarTab>('endpoints');

  const hasSchemas = spec?.components?.schemas && Object.keys(spec.components.schemas).length > 0;

  return (
    <ResizableSidebarLayout>
      <SidebarHeader />

      {hasSchemas && (
        <div
          style={{
            display: 'flex',
            gap: '0.3rem',
            margin: '0 1.6rem',
            padding: '0.3rem',
            borderRadius: '0.8rem',
            backgroundColor: colors.bg.subtle,
            marginBottom: '0.8rem',
          }}
        >
          <TabButton
            label='Endpoints'
            isActive={activeTab === 'endpoints'}
            onClick={() => setActiveTab('endpoints')}
            colors={colors}
          />
          <TabButton
            label='Models'
            isActive={activeTab === 'models'}
            onClick={() => setActiveTab('models')}
            colors={colors}
          />
        </div>
      )}

      {activeTab === 'endpoints' ? <SidebarEndpointList /> : <SidebarModelsList />}
    </ResizableSidebarLayout>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
  colors,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '0.6rem 0',
        fontSize: '1.2rem',
        fontWeight: isActive ? 600 : 500,
        backgroundColor: isActive ? colors.bg.overlay : 'transparent',
        color: isActive ? colors.text.primary : colors.text.tertiary,
        border: 'none',
        borderRadius: '0.6rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: isActive ? `0 1px 2px rgba(0, 0, 0, 0.06)` : 'none',
      }}
    >
      {label}
    </button>
  );
}

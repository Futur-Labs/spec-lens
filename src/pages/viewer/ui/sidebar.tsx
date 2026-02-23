import { useDeferredValue, useMemo, useState } from 'react';

import { ResizableSidebarLayout } from './resizable-sidebar-layout';
import { SidebarEndpointList } from './sidebar-endpoint-list';
import { SidebarHeader } from './sidebar-header';
import { SidebarModelsList } from './sidebar-models-list';
import { SidebarWebhookList } from './sidebar-webhook-list';
import { useSpec } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { SegmentedControl, type SegmentItem } from '@/shared/ui/segmented-control';

type SidebarTab = 'endpoints' | 'models' | 'webhooks';

export function Sidebar() {
  const colors = useColors();
  const spec = useSpec();
  const [activeTab, setActiveTab] = useState<SidebarTab>('endpoints');
  const deferredTab = useDeferredValue(activeTab);

  const hasSchemas = spec?.components?.schemas && Object.keys(spec.components.schemas).length > 0;
  const hasWebhooks = spec?.webhooks && Object.keys(spec.webhooks).length > 0;
  const hasTabs = hasSchemas || hasWebhooks;

  const tabItems = useMemo(() => {
    const items: SegmentItem<SidebarTab>[] = [{ label: 'Endpoints', value: 'endpoints' }];
    if (hasSchemas) items.push({ label: 'Models', value: 'models' });
    if (hasWebhooks) items.push({ label: 'Webhooks', value: 'webhooks' });
    return items;
  }, [hasSchemas, hasWebhooks]);

  return (
    <ResizableSidebarLayout>
      <SidebarHeader activeTab={activeTab} />

      {hasTabs && (
        <SegmentedControl<SidebarTab>
          items={tabItems}
          value={activeTab}
          onChange={setActiveTab}
          style={{
            gap: '0.3rem',
            margin: '1rem 1.6rem',
            padding: '0.4rem',
            borderRadius: '0.4rem',
            backgroundColor: colors.bg.subtle,
            marginBottom: '0.8rem',
          }}
          itemStyle={({ isSelected }) => ({
            flex: 1,
            padding: '0.6rem 0',
            fontSize: '1.2rem',
            fontWeight: 500,
            backgroundColor: isSelected ? colors.bg.overlay : 'transparent',
            color: isSelected ? colors.text.primary : colors.text.tertiary,
            borderRadius: '0.6rem',
            transition: 'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
            boxShadow: isSelected ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
          })}
        />
      )}

      {deferredTab === 'endpoints' && <SidebarEndpointList />}
      {deferredTab === 'models' && <SidebarModelsList />}
      {deferredTab === 'webhooks' && <SidebarWebhookList />}
    </ResizableSidebarLayout>
  );
}

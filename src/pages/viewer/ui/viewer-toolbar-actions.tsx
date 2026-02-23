import { GitCompare } from 'lucide-react';

import { useSpecStore } from '@/entities/api-spec';
import { diffModeActions, useIsDiffMode } from '@/features/spec-diff';
import { SpecClearButton, SpecDownloadButton, SpecRefreshButton } from '@/features/spec-refresh';
import { useColors } from '@/shared/theme';
import { Tooltip } from '@/shared/ui/tooltip';

export function ViewerToolbarActions() {
  const colors = useColors();
  const specSource = useSpecStore((s) => s.specSource);
  const isDiffMode = useIsDiffMode();

  const canRefresh = specSource?.type === 'url';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
      <Tooltip content='Compare specs' placement='bottom'>
        <button
          onClick={diffModeActions.toggleDiffMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.7rem 0.8rem',
            backgroundColor: isDiffMode ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: isDiffMode ? 'rgba(59, 130, 246, 0.3)' : colors.border.subtle,
            borderRadius: '0.4rem',
            cursor: 'pointer',
            color: isDiffMode ? '#60a5fa' : colors.text.tertiary,
            transition: 'all 0.15s ease',
          }}
        >
          <GitCompare size={16} />
        </button>
      </Tooltip>
      <SpecDownloadButton />
      {canRefresh && <SpecRefreshButton />}
      <SpecClearButton />
    </div>
  );
}

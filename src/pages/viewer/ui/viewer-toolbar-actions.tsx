import { Download } from 'lucide-react';

import { useSpecStore } from '@/entities/api-spec';
import { SpecClearButton, SpecRefreshButton } from '@/features/spec-refresh';

export function ViewerToolbarActions() {
  const specSource = useSpecStore((s) => s.specSource);
  const spec = useSpecStore((s) => s.spec);

  const canRefresh = specSource?.type === 'url';

  const handleDownloadSpec = () => {
    if (!spec) return;
    const json = JSON.stringify(spec, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const title = spec.info?.title?.replace(/[^a-zA-Z0-9가-힣\s-_]/g, '') || 'openapi-spec';
    a.download = `${title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
      <button
        onClick={handleDownloadSpec}
        disabled={!spec}
        title='Download Spec'
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '3.2rem',
          height: '3.2rem',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '0.6rem',
          cursor: spec ? 'pointer' : 'not-allowed',
          opacity: spec ? 1 : 0.5,
          color: 'inherit',
        }}
      >
        <Download size={18} />
      </button>
      {canRefresh && <SpecRefreshButton />}
      <SpecClearButton />
    </div>
  );
}

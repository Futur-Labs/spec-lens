import { FileCode, FileJson } from 'lucide-react';

import { useColors } from '@/shared/theme';

export function JsonActionWrapperToggleButton({
  view,
  setView,
}: {
  view: 'schema' | 'json';
  setView: (view: 'schema' | 'json') => void;
}) {
  const colors = useColors();

  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: colors.bg.overlay,
        padding: '0.4rem',
        borderRadius: '0.6rem',
        gap: '0.4rem',
      }}
    >
      <button
        onClick={() => setView('schema')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.6rem 1.2rem',
          borderRadius: '0.4rem',
          border: 'none',
          backgroundColor: view === 'schema' ? colors.bg.overlayHover : 'transparent',
          color: view === 'schema' ? colors.text.primary : colors.text.secondary,
          fontSize: '1.2rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <FileCode size={14} />
        Schema
      </button>
      <button
        onClick={() => setView('json')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.6rem 1.2rem',
          borderRadius: '0.4rem',
          border: 'none',
          backgroundColor: view === 'json' ? colors.bg.overlayHover : 'transparent',
          color: view === 'json' ? colors.text.primary : colors.text.secondary,
          fontSize: '1.2rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <FileJson size={14} />
        JSON
      </button>
    </div>
  );
}

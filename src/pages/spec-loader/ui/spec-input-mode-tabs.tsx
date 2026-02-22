import type { SpecLoaderType } from '../model/spec-loader-types';
import { useColors } from '@/shared/theme';

export function SpecInputModeTabs({
  inputMode,
  setInputMode,
}: {
  inputMode: SpecLoaderType;
  setInputMode: (mode: SpecLoaderType) => void;
}) {
  const colors = useColors();

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.4rem',
        marginBottom: '2.4rem',
        backgroundColor: colors.bg.overlay,
        borderRadius: '0.8rem',
        padding: '0.4rem',
      }}
    >
      <button
        onClick={() => setInputMode('file')}
        style={{
          flex: 1,
          padding: '1rem 1.6rem',
          backgroundColor: inputMode === 'file' ? colors.interactive.primary : 'transparent',
          border: 'none',
          borderRadius: '0.6rem',
          color: inputMode === 'file' ? colors.text.onBrand : colors.text.secondary,
          fontSize: '1.4rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        File Upload
      </button>
      <button
        onClick={() => setInputMode('url')}
        style={{
          flex: 1,
          padding: '1rem 1.6rem',
          backgroundColor: inputMode === 'url' ? colors.interactive.primary : 'transparent',
          border: 'none',
          borderRadius: '0.6rem',
          color: inputMode === 'url' ? colors.text.onBrand : colors.text.secondary,
          fontSize: '1.4rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        URL Input
      </button>
    </div>
  );
}

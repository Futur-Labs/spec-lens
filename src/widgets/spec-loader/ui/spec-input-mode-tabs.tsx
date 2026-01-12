import type { SpecLoaderType } from '../model/spec-loader-types';

export function SpecInputModeTabs({
  inputMode,
  setInputMode,
}: {
  inputMode: SpecLoaderType;
  setInputMode: (mode: SpecLoaderType) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.4rem',
        marginBottom: '2.4rem',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '0.8rem',
        padding: '0.4rem',
      }}
    >
      <button
        onClick={() => setInputMode('file')}
        style={{
          flex: 1,
          padding: '1rem 1.6rem',
          backgroundColor: inputMode === 'file' ? '#075D46' : 'transparent',
          border: 'none',
          borderRadius: '0.6rem',
          color: inputMode === 'file' ? '#fff' : '#9ca3af',
          fontSize: '1.4rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        파일 업로드
      </button>
      <button
        onClick={() => setInputMode('url')}
        style={{
          flex: 1,
          padding: '1rem 1.6rem',
          backgroundColor: inputMode === 'url' ? '#075D46' : 'transparent',
          border: 'none',
          borderRadius: '0.6rem',
          color: inputMode === 'url' ? '#fff' : '#9ca3af',
          fontSize: '1.4rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        URL 입력
      </button>
    </div>
  );
}

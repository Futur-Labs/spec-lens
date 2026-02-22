import { Link } from 'lucide-react';

import { useColors } from '@/shared/theme';

export function UrlInput({
  url,
  setUrl,
  setLocalError,
}: {
  url: string;
  setUrl: (url: string) => void;
  setLocalError: (error: string | null) => void;
}) {
  const colors = useColors();

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '1.2rem',
        padding: '0 1.2rem',
        backgroundColor: colors.bg.overlay,
        borderRadius: '0.6rem',
        border: `1px solid ${colors.border.default}`,
      }}
    >
      <Link size={18} color={colors.text.tertiary} />
      <input
        type='text'
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setLocalError(null);
        }}
        placeholder='https://api.example.com/openapi.json'
        style={{
          flex: 1,
          padding: '1rem 0',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          color: colors.text.primary,
          fontSize: '1.4rem',
        }}
      />
    </div>
  );
}

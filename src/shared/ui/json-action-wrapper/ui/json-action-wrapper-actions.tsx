import { Check, Copy } from 'lucide-react';

import { useCopyState } from '../model/use-copy-state';
import { useColors } from '@/shared/theme';

export function JsonActionWrapperActions({ jsonString }: { jsonString: string }) {
  const colors = useColors();

  const { copied, handleCopy } = useCopyState(jsonString);

  return (
    <div style={{ display: 'flex', gap: '0.8rem' }}>
      <button
        onClick={handleCopy}
        title='Copy JSON'
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.6rem 1rem',
          backgroundColor: colors.bg.overlay,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '0.6rem',
          color: colors.text.primary,
          cursor: 'pointer',
          fontSize: '1.2rem',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.bg.overlayHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.bg.overlay;
        }}
      >
        {copied ? <Check size={14} color='#10b981' /> : <Copy size={14} />}
        {copied ? 'Copied!' : 'Copy JSON'}
      </button>
    </div>
  );
}

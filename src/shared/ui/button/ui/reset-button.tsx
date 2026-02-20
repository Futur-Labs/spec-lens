import type { ButtonHTMLAttributes } from 'react';

import { RotateCcw } from 'lucide-react';

import { useColors } from '@/shared/theme';

export function ResetButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const colors = useColors();

  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: colors.feedback.warning,
        fontSize: '1.1rem',
      }}
      {...props}
    >
      <RotateCcw size={10} />
      Reset
    </button>
  );
}

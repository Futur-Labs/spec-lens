import { getMethodColor, getMethodSizeStyle } from '../lib/method-style.ts';
import type { HttpMethod } from '@/shared/type';

export function MethodBadge({
  method,
  size = 'md',
}: {
  method: HttpMethod;
  size?: 'sm' | 'md' | 'lg';
}) {
  const color = getMethodColor(method);
  const sizeStyle = getMethodSizeStyle(size);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
        borderRadius: '0.4rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        fontFamily: 'monospace',
        letterSpacing: '0.025em',
        flexShrink: 0,
        ...sizeStyle,
      }}
    >
      {method}
    </span>
  );
}

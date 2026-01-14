import { getMethodColor } from '../lib/openapi-parser.ts';
import type { HttpMethod } from '@/shared/type';

export function MethodBadge({
  method,
  size = 'md',
}: {
  method: HttpMethod;
  size?: 'sm' | 'md' | 'lg';
}) {
  const color = getMethodColor(method);

  const sizeStyles = {
    sm: {
      fontSize: '1rem',
      padding: '0.25rem 0.6rem',
      minWidth: '4rem',
    },
    md: {
      fontSize: '1.1rem',
      padding: '0.4rem 0.8rem',
      minWidth: '5.6rem',
    },
    lg: {
      fontSize: '1.2rem',
      padding: '0.4rem 1.2rem',
      minWidth: '6.4rem',
    },
  };

  const styles = sizeStyles[size];

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
        ...styles,
      }}
    >
      {method}
    </span>
  );
}

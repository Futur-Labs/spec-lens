import type { HttpMethod } from '@/shared/type';

export function getMethodColor(method: HttpMethod): string {
  const colors: Record<HttpMethod, string> = {
    get: '#10b981',
    post: '#3b82f6',
    put: '#f59e0b',
    delete: '#ef4444',
    patch: '#8b5cf6',
    options: '#6b7280',
    head: '#6b7280',
    trace: '#6b7280',
  };
  return colors[method] || '#6b7280';
}

export function getMethodSizeStyle(size: 'sm' | 'md' | 'lg') {
  const methodSize = {
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

  return methodSize[size];
}

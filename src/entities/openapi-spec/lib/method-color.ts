import type { HttpMethod } from '@/shared/type';

/**
 * Get method color for UI display
 */
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

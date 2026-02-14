export function getStatusCodeColor(statusCode: string): string {
  const code = parseInt(statusCode, 10);
  if (code >= 200 && code < 300) return '#10b981';
  if (code >= 300 && code < 400) return '#3b82f6';
  if (code >= 400 && code < 500) return '#f59e0b';
  if (code >= 500) return '#ef4444';
  return '#6b7280';
}

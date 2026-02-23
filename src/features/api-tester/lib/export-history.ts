import type { HistoryEntry } from '@/entities/history';

type ExportFormat = 'json' | 'csv';

/**
 * 히스토리를 파일로 다운로드
 */
export function exportHistory(entries: HistoryEntry[], format: ExportFormat = 'json') {
  if (entries.length === 0) return;

  const { content, mimeType, extension } =
    format === 'csv'
      ? { content: toCsv(entries), mimeType: 'text/csv', extension: 'csv' }
      : { content: toJson(entries), mimeType: 'application/json', extension: 'json' };

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `speclens-history-${new Date().toISOString().slice(0, 10)}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toJson(entries: HistoryEntry[]): string {
  const exported = entries.map((e) => ({
    timestamp: new Date(e.timestamp).toISOString(),
    method: e.method,
    url: e.url,
    path: e.path,
    summary: e.summary,
    duration: e.duration,
    status: e.response?.status ?? null,
    error: e.error,
    request: e.request,
    response: e.response ? { status: e.response.status, data: e.response.data } : null,
  }));

  return JSON.stringify(exported, null, 2);
}

function toCsv(entries: HistoryEntry[]): string {
  const header = 'timestamp,method,url,status,duration_ms,error';
  const rows = entries.map((e) => {
    const ts = new Date(e.timestamp).toISOString();
    const status = e.response?.status ?? '';
    const duration = e.duration ?? '';
    const error = e.error ? `"${e.error.replace(/"/g, '""')}"` : '';
    return `${ts},${e.method},"${e.url}",${status},${duration},${error}`;
  });

  return [header, ...rows].join('\n');
}

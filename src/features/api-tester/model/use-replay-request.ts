import { useState } from 'react';

import { executeApiTestRequest } from '../lib/execute-api-test-request';
import { historyStoreActions, type HistoryEntry } from '@/entities/history';

type ReplayParams = {
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body: string;
};

function deriveBaseUrl(entry: HistoryEntry): string {
  if (!entry.path) return entry.url;
  return entry.url.slice(0, entry.url.length - entry.path.length);
}

export function useReplayRequest() {
  const [isReplaying, setIsReplaying] = useState(false);

  const replay = async (
    entry: HistoryEntry,
    overrides?: Partial<ReplayParams>,
  ): Promise<HistoryEntry | null> => {
    setIsReplaying(true);

    const baseUrl = deriveBaseUrl(entry);
    const params = {
      pathParams: overrides?.pathParams ?? entry.request.pathParams,
      queryParams: overrides?.queryParams ?? entry.request.queryParams,
      headers: overrides?.headers ?? entry.request.headers,
      body: overrides?.body ?? entry.request.body,
    };

    const startTime = Date.now();

    try {
      const result = await executeApiTestRequest({
        baseUrl,
        path: entry.path,
        method: entry.method,
        ...params,
      });

      const duration = Date.now() - startTime;

      const newEntry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: Date.now(),
        method: entry.method,
        url: entry.url,
        path: entry.path,
        request: params,
        response: result.success ? result.response : null,
        error: result.success ? null : result.error,
        duration,
      };

      historyStoreActions.addToHistory(newEntry);
      setIsReplaying(false);
      return newEntry;
    } catch {
      setIsReplaying(false);
      return null;
    }
  };

  return { replay, isReplaying };
}

import type { ResponseState } from '@/shared/server';
import type { HttpMethod } from '@/shared/type';

export type HistoryEntry = {
  id: string; // Unique ID (timestamp + random)
  timestamp: number;
  method: HttpMethod;
  url: string; // Full URL (baseUrl + path)
  path: string; // Endpoint path
  // Request parameters (for replay)
  request: {
    pathParams: Record<string, string>;
    queryParams: Record<string, string>;
    headers: Record<string, string>;
    body: string;
  };
  // Response
  response: ResponseState | null;
  error: string | null;
  // Metadata
  duration?: number; // Request duration (ms)
};

export type HistoryState = {
  history: HistoryEntry[];
};

export type HistoryActions = {
  addToHistory: (entry: HistoryEntry) => void;
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;
};

export type HistoryStore = HistoryState & { actions: HistoryActions };

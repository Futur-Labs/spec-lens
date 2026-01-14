import type { ResponseState } from './api-tester-types';
import type { HttpMethod } from '@/entities/openapi';

export interface HistoryEntry {
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
}

export interface HistoryState {
  history: HistoryEntry[];
}

export interface HistoryActions {
  addToHistory: (entry: HistoryEntry) => void;
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;
}

export type HistoryStore = HistoryState & { actions: HistoryActions };

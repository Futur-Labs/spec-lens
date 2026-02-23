import type { ParsedEndpoint } from '@/entities/api-spec';

export type SnippetLang = 'curl' | 'javascript' | 'python';

export const SNIPPET_LABELS: Record<SnippetLang, string> = {
  curl: 'cURL',
  javascript: 'JavaScript',
  python: 'Python',
};

export type ExecuteActionsProps = {
  requestCount: number;
  requestInterval: number;
  endpoint: ParsedEndpoint;
  jsonError: string | null;
};

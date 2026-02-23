import type { PathItemObject } from '@/entities/api-spec';
import type { HttpMethod } from '@/shared/type';
import { HTTP_METHODS } from '@/shared/type';

export type WebhookEntry = {
  name: string;
  method: HttpMethod;
  summary?: string;
};

export function parseWebhooks(webhooks: Record<string, PathItemObject>): WebhookEntry[] {
  const entries: WebhookEntry[] = [];

  for (const [name, pathItem] of Object.entries(webhooks)) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (operation) {
        entries.push({
          name,
          method,
          summary: operation.summary,
        });
      }
    }
  }

  return entries;
}

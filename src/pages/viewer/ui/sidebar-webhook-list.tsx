import { Webhook } from 'lucide-react';

import {
  endpointSelectionStoreActions,
  type PathItemObject,
  useSelectedWebhook,
  useSpec,
  MethodBadge,
} from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { type HttpMethod, HTTP_METHODS } from '@/shared/type';

type WebhookEntry = {
  name: string;
  method: HttpMethod;
  summary?: string;
};

function parseWebhooks(webhooks: Record<string, PathItemObject>): WebhookEntry[] {
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

export function SidebarWebhookList() {
  const colors = useColors();
  const spec = useSpec();
  const selectedWebhook = useSelectedWebhook();

  if (!spec?.webhooks) return null;

  const webhookEntries = parseWebhooks(spec.webhooks);

  if (webhookEntries.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          padding: '3.2rem 1.6rem',
          textAlign: 'center',
          color: colors.text.tertiary,
          fontSize: '1.3rem',
        }}
      >
        No webhooks defined
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '1.2rem 1.6rem 0.8rem',
          color: colors.text.tertiary,
          fontSize: '1.1rem',
        }}
      >
        <Webhook size={12} />
        <span>{webhookEntries.length} webhook(s)</span>
      </div>
      {webhookEntries.map((entry) => {
        const isSelected =
          selectedWebhook?.name === entry.name && selectedWebhook?.method === entry.method;

        return (
          <button
            key={`${entry.name}-${entry.method}`}
            onClick={() =>
              endpointSelectionStoreActions.selectWebhook(entry.name, entry.method)
            }
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '0.8rem 1.6rem',
              backgroundColor: isSelected ? colors.bg.overlayHover : 'transparent',
              border: 'none',
              borderLeft: isSelected
                ? `2px solid ${colors.feedback.info}`
                : '2px solid transparent',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease',
            }}
          >
            <MethodBadge method={entry.method} size='sm' />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
                overflow: 'hidden',
                flex: 1,
              }}
            >
              <span
                style={{
                  color: isSelected ? colors.text.primary : colors.text.secondary,
                  fontSize: '1.2rem',
                  fontWeight: isSelected ? 600 : 400,
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {entry.name}
              </span>
              {entry.summary && (
                <span
                  style={{
                    color: colors.text.tertiary,
                    fontSize: '1rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {entry.summary}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

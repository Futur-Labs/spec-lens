import { useState } from 'react';

import { Check, Copy } from 'lucide-react';

import { HistoryKeyValueTable } from './history-key-value-table';
import { getIconButtonStyle } from '../lib/icon-button-style';
import type { HistoryEntry } from '@/entities/history';
import { copyToClipboard } from '@/shared/lib';
import { useColors } from '@/shared/theme';
import { CollapsibleSection } from '@/shared/ui/section';

export function HistoryDetailResponse({ entry }: { entry: HistoryEntry }) {
  const colors = useColors();
  const iconButtonStyle = getIconButtonStyle(colors);
  const [copiedResponse, setCopiedResponse] = useState(false);

  if (!entry.response) return null;

  const handleCopyResponseBody = () => {
    if (!entry.response) return;
    const text =
      typeof entry.response.data === 'string'
        ? entry.response.data
        : JSON.stringify(entry.response.data, null, 2);

    copyToClipboard(text, () => {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    });
  };

  return (
    <>
      <CollapsibleSection
        title='Response Body'
        badge={
          <button
            onClick={handleCopyResponseBody}
            style={{
              ...iconButtonStyle,
              width: '2rem',
              height: '2rem',
              marginLeft: '1rem',
            }}
            title='Copy response body'
          >
            {copiedResponse ? <Check size={12} /> : <Copy size={12} />}
          </button>
        }
        childrenContainerStyle={{ paddingBottom: 0 }}
      >
        <pre
          style={{
            margin: 0,
            padding: '1rem',
            backgroundColor: colors.bg.subtle,
            borderRadius: '0.6rem',
            fontSize: '1.2rem',
            fontFamily: 'monospace',
            color: colors.text.primary,
            overflow: 'auto',
            maxHeight: '400px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {typeof entry.response.data === 'string'
            ? entry.response.data
            : JSON.stringify(entry.response.data, null, 2)}
        </pre>
      </CollapsibleSection>

      {entry.response.headers && Object.keys(entry.response.headers).length > 0 && (
        <CollapsibleSection
          title='Response Headers'
          badge={
            <span style={{ fontSize: '1.1rem', color: colors.text.tertiary, marginLeft: '0.4rem' }}>
              ({Object.keys(entry.response.headers).length})
            </span>
          }
          childrenContainerStyle={{ paddingTop: 0 }}
        >
          <HistoryKeyValueTable data={entry.response.headers} emptyMessage='No response headers' />
        </CollapsibleSection>
      )}
    </>
  );
}

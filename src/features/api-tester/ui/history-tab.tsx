import { Trash2 } from 'lucide-react';

import { getMethodColor } from '@/entities/api-spec';
import { historyStoreActions, useHistory, type HistoryEntry } from '@/entities/history';
import { useColors } from '@/shared/theme';

export function HistoryTab() {
  const colors = useColors();
  const history = useHistory();

  if (history.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: colors.text.tertiary,
          fontSize: '1.2rem',
        }}
      >
        No request history yet. Make API requests to see them here.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header with Clear All button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: colors.text.secondary, fontSize: '1.2rem' }}>
          Recent Requests ({history.length})
        </span>
        <button
          onClick={() => historyStoreActions.clearHistory()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.4rem',
            color: colors.feedback.error,
            fontSize: '1.1rem',
            cursor: 'pointer',
          }}
        >
          <Trash2 size={12} />
          Clear All
        </button>
      </div>

      {/* History List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        {history.map((entry) => (
          <HistoryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const colors = useColors();
  const statusColor = entry.error
    ? colors.feedback.error
    : entry.response?.status && entry.response.status >= 400
      ? colors.feedback.warning
      : colors.feedback.success;

  const formattedTime = new Date(entry.timestamp).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.8rem 1rem',
        backgroundColor: colors.bg.overlay,
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: '0.6rem',
      }}
    >
      {/* Method Badge */}
      <span
        style={{
          padding: '0.2rem 0.6rem',
          backgroundColor: getMethodColor(entry.method),
          borderRadius: '0.3rem',
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.text.onBrand,
          textTransform: 'uppercase',
          minWidth: '4.5rem',
          textAlign: 'center',
        }}
      >
        {entry.method}
      </span>

      {/* Path */}
      <span
        style={{
          flex: 1,
          color: colors.text.primary,
          fontSize: '1.2rem',
          fontFamily: 'monospace',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={entry.url}
      >
        {entry.path}
      </span>

      {/* Status */}
      <span
        style={{
          padding: '0.2rem 0.6rem',
          backgroundColor: `${statusColor}20`,
          borderRadius: '0.3rem',
          fontSize: '1.1rem',
          color: statusColor,
          fontWeight: 500,
        }}
      >
        {entry.error ? 'Error' : entry.response?.status || '-'}
      </span>

      {/* Duration */}
      {entry.duration !== undefined && (
        <span style={{ color: colors.text.tertiary, fontSize: '1.1rem', minWidth: '5rem' }}>
          {entry.duration}ms
        </span>
      )}

      {/* Time */}
      <span style={{ color: colors.text.tertiary, fontSize: '1.1rem', minWidth: '7rem' }}>
        {formattedTime}
      </span>

      {/* Delete Button */}
      <button
        onClick={() => historyStoreActions.removeHistoryEntry(entry.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2rem',
          height: '2rem',
          backgroundColor: 'transparent',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.4rem',
          cursor: 'pointer',
          color: colors.feedback.error,
        }}
        title='Delete'
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

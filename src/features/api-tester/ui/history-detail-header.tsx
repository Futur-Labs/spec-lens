import { ArrowLeft } from 'lucide-react';

import { getMethodColor, getStatusCodeColor, getStatusText } from '@/entities/api-spec';
import type { HistoryEntry } from '@/entities/history';
import { formatBytes } from '@/shared/lib';
import { useColors } from '@/shared/theme';

export function HistoryDetailHeader({
  entry,
  onBack,
}: {
  entry: HistoryEntry;
  onBack: () => void;
}) {
  const colors = useColors();

  const statusColor = entry.error
    ? colors.feedback.error
    : entry.response?.status && entry.response.status >= 400
      ? colors.feedback.warning
      : colors.feedback.success;

  const formattedTime = new Date(entry.timestamp).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.text.secondary,
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0.4rem 0',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div style={{ flex: 1 }} />
        <span
          style={{
            padding: '0.2rem 0.6rem',
            backgroundColor: getMethodColor(entry.method),
            borderRadius: '0.3rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: colors.text.onBrand,
            textTransform: 'uppercase',
          }}
        >
          {entry.method}
        </span>
        <span
          style={{
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
      </div>

      {/* Meta bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {entry.response ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.2rem 0.8rem',
              borderRadius: '0.4rem',
              backgroundColor: `${getStatusCodeColor(entry.response.status)}18`,
              border: `1px solid ${getStatusCodeColor(entry.response.status)}30`,
              fontWeight: 700,
              fontSize: '1.2rem',
              color: getStatusCodeColor(entry.response.status),
            }}
          >
            {entry.response.status}
            {getStatusText(entry.response.status) && (
              <span style={{ fontWeight: 500, marginLeft: '0.4rem', fontSize: '1.1rem' }}>
                {getStatusText(entry.response.status)}
              </span>
            )}
          </span>
        ) : entry.error ? (
          <span
            style={{
              padding: '0.2rem 0.8rem',
              borderRadius: '0.4rem',
              backgroundColor: `${statusColor}20`,
              fontSize: '1.2rem',
              color: statusColor,
              fontWeight: 600,
            }}
          >
            Error
          </span>
        ) : null}
        {entry.duration !== undefined && (
          <span style={{ color: colors.text.tertiary, fontSize: '1.2rem' }}>
            {entry.duration}ms
          </span>
        )}
        {entry.response?.size !== undefined && (
          <span style={{ color: colors.text.tertiary, fontSize: '1.2rem' }}>
            {formatBytes(entry.response.size)}
          </span>
        )}
        <span style={{ color: colors.text.tertiary, fontSize: '1.1rem' }}>{formattedTime}</span>
      </div>
    </>
  );
}

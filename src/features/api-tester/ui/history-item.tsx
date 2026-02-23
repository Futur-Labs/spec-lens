import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';

import { Trash2 } from 'lucide-react';

import { getMethodColor } from '@/entities/api-spec';
import { historyStoreActions, type HistoryEntry } from '@/entities/history';
import { useColors } from '@/shared/theme';
import { Tooltip } from '@/shared/ui/tooltip';

export function HistoryItem({ entry, onClick }: { entry: HistoryEntry; onClick: () => void }) {
  const colors = useColors();
  const statusColor = entry.error
    ? colors.feedback.error
    : entry.response?.status && entry.response.status >= 400
      ? colors.feedback.warning
      : colors.feedback.success;

  const formattedTime = format(new Date(entry.timestamp), 'M월 d일 HH:mm', { locale: ko });
  const pathRef = useRef<HTMLSpanElement>(null);
  const [isPathTruncated, setIsPathTruncated] = useState(false);

  useEffect(() => {
    const element = pathRef.current;
    if (!element) return;

    const checkTruncation = () => {
      setIsPathTruncated(element.scrollWidth > element.clientWidth + 1);
    };

    const rafId = requestAnimationFrame(checkTruncation);

    const resizeObserver = new ResizeObserver(checkTruncation);
    resizeObserver.observe(element);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [entry.path]);

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.8rem 1rem',
        backgroundColor: colors.bg.overlay,
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: '0.6rem',
        cursor: 'pointer',
        transition: 'background-color 0.1s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg.overlayHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg.overlay;
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
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Tooltip
          content={
            entry.summary ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{entry.path}</span>
                <span style={{ fontSize: '1rem', opacity: 0.7 }}>{entry.summary}</span>
              </div>
            ) : (
              entry.path
            )
          }
          contentStyle={{ padding: '0.6rem 1rem', fontSize: '1.4rem' }}
          placement='top'
          delay={0}
          fullWidth
          disabled={!isPathTruncated}
        >
          <span
            ref={pathRef}
            style={{
              display: 'block',
              color: colors.text.primary,
              fontSize: '1.2rem',
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {entry.path}
          </span>
        </Tooltip>
      </div>

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
        onClick={(e) => {
          e.stopPropagation();
          historyStoreActions.removeHistoryEntry(entry.id);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2rem',
          height: '2rem',
          backgroundColor: 'transparent',
          border: `1px solid ${colors.feedback.error}40`,
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

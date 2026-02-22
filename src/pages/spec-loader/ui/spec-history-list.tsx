import { FileText, Globe, X } from 'lucide-react';

import {
  type SpecHistoryEntry,
  specHistoryActions,
  useSpecHistoryEntries,
  useSpecHistoryHydration,
} from '@/entities/api-spec';
import { setSpecWithExpanded } from '@/features/spec-import';
import { useColors } from '@/shared/theme';

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString();
}

function HistoryItem({ entry }: { entry: SpecHistoryEntry }) {
  const colors = useColors();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.2rem',
        padding: '1.2rem 1.6rem',
        borderRadius: '0.8rem',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        backgroundColor: 'transparent',
      }}
      role='button'
      tabIndex={0}
      onClick={() => setSpecWithExpanded(entry.spec, entry.specSource)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setSpecWithExpanded(entry.spec, entry.specSource);
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg.overlay;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '3.2rem',
          height: '3.2rem',
          borderRadius: '0.6rem',
          backgroundColor: colors.bg.overlay,
          flexShrink: 0,
        }}
      >
        {entry.type === 'url' ? (
          <Globe size={16} style={{ color: colors.text.tertiary }} />
        ) : (
          <FileText size={16} style={{ color: colors.text.tertiary }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <span
            style={{
              fontSize: '1.3rem',
              fontWeight: 600,
              color: colors.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {entry.title}
          </span>
          {entry.version && (
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 500,
                color: colors.text.tertiary,
                backgroundColor: colors.bg.overlay,
                padding: '0.1rem 0.5rem',
                borderRadius: '0.4rem',
                flexShrink: 0,
              }}
            >
              v{entry.version}
            </span>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginTop: '0.2rem',
          }}
        >
          <span
            style={{
              fontSize: '1.1rem',
              color: colors.text.tertiary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: entry.type === 'url' ? 'monospace' : undefined,
            }}
          >
            {entry.name}
          </span>
          <span style={{ fontSize: '1rem', color: colors.text.disabled }}>·</span>
          <span
            style={{
              fontSize: '1.1rem',
              color: colors.text.tertiary,
              flexShrink: 0,
            }}
          >
            {entry.endpointCount} endpoints
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '1.1rem', color: colors.text.disabled }}>
          {formatDate(entry.timestamp)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            specHistoryActions.removeEntry(entry.id);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.4rem',
            height: '2.4rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0.4rem',
            color: colors.text.disabled,
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.text.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.text.disabled;
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export function SpecHistoryList() {
  const colors = useColors();
  const historyHydrated = useSpecHistoryHydration();
  const entries = useSpecHistoryEntries();

  if (!historyHydrated || entries.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '2.4rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.8rem',
          padding: '0 0.4rem',
        }}
      >
        <span
          style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            color: colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Recent
        </span>
        <button
          onClick={() => specHistoryActions.clearAll()}
          style={{
            fontSize: '1.1rem',
            color: colors.text.disabled,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.2rem 0.4rem',
            borderRadius: '0.4rem',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.text.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.text.disabled;
          }}
        >
          Clear all
        </button>
      </div>
      <div
        style={{
          backgroundColor: colors.bg.overlay,
          borderRadius: '1.2rem',
          border: `1px solid ${colors.border.default}`,
          overflow: 'hidden',
        }}
      >
        {entries.map((entry, index) => (
          <div key={entry.id}>
            <HistoryItem entry={entry} />
            {index < entries.length - 1 && (
              <div
                style={{
                  height: 1,
                  backgroundColor: colors.border.default,
                  margin: '0 1.6rem',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

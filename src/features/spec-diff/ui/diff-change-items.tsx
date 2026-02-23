import type { EndpointChange, EndpointModification } from '../model/spec-diff-types';
import { MethodBadge } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

export function EndpointChangeItem({
  change,
  type,
}: {
  change: EndpointChange;
  type: 'added' | 'removed';
}) {
  const colors = useColors();
  const colorMap = {
    added: { bg: 'rgba(34, 197, 94, 0.05)', border: 'rgba(34, 197, 94, 0.2)' },
    removed: { bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.2)' },
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.6rem 1rem',
        backgroundColor: colorMap[type].bg,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: colorMap[type].border,
        borderRadius: '0.4rem',
      }}
    >
      <MethodBadge method={change.method} size='sm' />
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '1.2rem',
          color: colors.text.primary,
          flex: 1,
        }}
      >
        {change.path}
      </span>
      {change.summary && (
        <span
          style={{
            fontSize: '1.1rem',
            color: colors.text.tertiary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '20rem',
          }}
        >
          {change.summary}
        </span>
      )}
    </div>
  );
}

export function EndpointModificationItem({ modification }: { modification: EndpointModification }) {
  const colors = useColors();

  return (
    <div
      style={{
        padding: '0.6rem 1rem',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(245, 158, 11, 0.2)',
        borderRadius: '0.4rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
        <MethodBadge method={modification.method} size='sm' />
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            color: colors.text.primary,
            flex: 1,
          }}
        >
          {modification.path}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', paddingLeft: '0.4rem' }}>
        {modification.changes.map((change, i) => (
          <span
            key={i}
            style={{
              padding: '0.15rem 0.5rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '0.3rem',
              fontSize: '1rem',
              color: colors.feedback.warning,
            }}
          >
            {change}
          </span>
        ))}
      </div>
    </div>
  );
}

import { Minus, Pencil, Plus } from 'lucide-react';

import { EndpointChangeItem, EndpointModificationItem } from './diff-change-items';
import { DiffSummaryBadge } from './diff-summary-badge';
import type { DiffResult } from '../model/spec-diff-types';
import { useColors } from '@/shared/theme';

export function DiffResults({ result }: { result: DiffResult }) {
  const colors = useColors();
  const { added, removed, modified, summary } = result;

  const hasChanges = summary.totalAdded + summary.totalRemoved + summary.totalModified > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      {/* Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.2rem',
          backgroundColor: colors.bg.overlay,
          borderRadius: '0.6rem',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: colors.border.subtle,
        }}
      >
        <span style={{ fontSize: '1.2rem', color: colors.text.secondary }}>
          {summary.oldEndpointCount} → {summary.newEndpointCount} endpoints
        </span>
        <div style={{ display: 'flex', gap: '0.6rem', marginLeft: 'auto' }}>
          <DiffSummaryBadge count={summary.totalAdded} type='added' />
          <DiffSummaryBadge count={summary.totalRemoved} type='removed' />
          <DiffSummaryBadge count={summary.totalModified} type='modified' />
        </div>
      </div>

      {!hasChanges && (
        <p style={{ textAlign: 'center', color: colors.text.tertiary, fontSize: '1.3rem' }}>
          No differences found between the two specs.
        </p>
      )}

      {/* Added */}
      {added.length > 0 && (
        <div>
          <h4
            style={{
              margin: '0 0 0.6rem',
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Plus size={13} /> Added ({added.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {added.map((change) => (
              <EndpointChangeItem
                key={`${change.method}:${change.path}`}
                change={change}
                type='added'
              />
            ))}
          </div>
        </div>
      )}

      {/* Removed */}
      {removed.length > 0 && (
        <div>
          <h4
            style={{
              margin: '0 0 0.6rem',
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Minus size={13} /> Removed ({removed.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {removed.map((change) => (
              <EndpointChangeItem
                key={`${change.method}:${change.path}`}
                change={change}
                type='removed'
              />
            ))}
          </div>
        </div>
      )}

      {/* Modified */}
      {modified.length > 0 && (
        <div>
          <h4
            style={{
              margin: '0 0 0.6rem',
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Pencil size={13} /> Modified ({modified.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {modified.map((mod) => (
              <EndpointModificationItem key={`${mod.method}:${mod.path}`} modification={mod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

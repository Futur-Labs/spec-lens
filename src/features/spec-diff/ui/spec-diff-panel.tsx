import { useState } from 'react';

import { ArrowRight, GitCompare, Minus, Pencil, Plus } from 'lucide-react';

import { diffSpecs } from '../lib/diff-specs';
import type { DiffResult, EndpointChange, EndpointModification } from '../model/spec-diff-types';
import { MethodBadge, type SpecHistoryEntry, useSpec, useSpecHistoryEntries } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

function DiffSummaryBadge({
  count,
  type,
}: {
  count: number;
  type: 'added' | 'removed' | 'modified';
}) {
  const colorMap = {
    added: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    removed: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
    modified: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  };

  const iconMap = {
    added: <Plus size={11} />,
    removed: <Minus size={11} />,
    modified: <Pencil size={11} />,
  };

  if (count === 0) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.6rem',
        backgroundColor: colorMap[type].bg,
        color: colorMap[type].text,
        borderRadius: '0.3rem',
        fontSize: '1.1rem',
        fontWeight: 500,
      }}
    >
      {iconMap[type]}
      {count}
    </span>
  );
}

function EndpointChangeItem({ change, type }: { change: EndpointChange; type: 'added' | 'removed' }) {
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

function EndpointModificationItem({ modification }: { modification: EndpointModification }) {
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

function DiffResults({ result }: { result: DiffResult }) {
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
              <EndpointModificationItem
                key={`${mod.method}:${mod.path}`}
                modification={mod}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SpecSelector({
  entries,
  selectedId,
  onSelect,
  label,
  currentSpecLabel,
}: {
  entries: SpecHistoryEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label: string;
  currentSpecLabel?: string;
}) {
  const colors = useColors();

  return (
    <div style={{ flex: 1 }}>
      <span
        style={{
          display: 'block',
          fontSize: '1.1rem',
          fontWeight: 500,
          color: colors.text.secondary,
          marginBottom: '0.4rem',
        }}
      >
        {label}
      </span>
      <select
        value={selectedId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          width: '100%',
          padding: '0.6rem 0.8rem',
          backgroundColor: colors.bg.overlay,
          color: colors.text.primary,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: colors.border.default,
          borderRadius: '0.4rem',
          fontSize: '1.2rem',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value='' disabled>
          Select spec...
        </option>
        {currentSpecLabel && <option value='__current__'>{currentSpecLabel}</option>}
        {entries.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.title} v{entry.version} ({entry.endpointCount} endpoints) —{' '}
            {new Date(entry.timestamp).toLocaleDateString()}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SpecDiffPanel() {
  const colors = useColors();
  const historyEntries = useSpecHistoryEntries();
  const currentSpec = useSpec();
  const [oldSpecId, setOldSpecId] = useState<string | null>(null);
  const [newSpecId, setNewSpecId] = useState<string | null>('__current__');
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

  const handleCompare = () => {
    if (!oldSpecId || !newSpecId) return;

    const oldSpec =
      oldSpecId === '__current__'
        ? currentSpec
        : historyEntries.find((e) => e.id === oldSpecId)?.spec;
    const newSpec =
      newSpecId === '__current__'
        ? currentSpec
        : historyEntries.find((e) => e.id === newSpecId)?.spec;

    if (!oldSpec || !newSpec) return;

    setDiffResult(diffSpecs(oldSpec, newSpec));
  };

  if (historyEntries.length === 0 && !currentSpec) {
    return (
      <p style={{ textAlign: 'center', color: colors.text.tertiary, fontSize: '1.3rem' }}>
        Load at least two specs to compare.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      {/* Selectors */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
        <SpecSelector
          entries={historyEntries}
          selectedId={oldSpecId}
          onSelect={setOldSpecId}
          label='Base (Old)'
          currentSpecLabel={
            currentSpec
              ? `Current: ${currentSpec.info.title} v${currentSpec.info.version}`
              : undefined
          }
        />
        <ArrowRight
          size={16}
          color={colors.text.tertiary}
          style={{ flexShrink: 0, marginBottom: '0.8rem' }}
        />
        <SpecSelector
          entries={historyEntries}
          selectedId={newSpecId}
          onSelect={setNewSpecId}
          label='Compare (New)'
          currentSpecLabel={
            currentSpec
              ? `Current: ${currentSpec.info.title} v${currentSpec.info.version}`
              : undefined
          }
        />
        <button
          onClick={handleCompare}
          disabled={!oldSpecId || !newSpecId || oldSpecId === newSpecId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.2rem',
            backgroundColor:
              oldSpecId && newSpecId && oldSpecId !== newSpecId
                ? '#2563eb'
                : colors.bg.overlayHover,
            border: 'none',
            borderRadius: '0.4rem',
            color: oldSpecId && newSpecId && oldSpecId !== newSpecId
              ? '#ffffff'
              : colors.text.tertiary,
            fontSize: '1.2rem',
            fontWeight: 500,
            cursor: oldSpecId && newSpecId && oldSpecId !== newSpecId ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            marginBottom: '0.1rem',
          }}
        >
          <GitCompare size={14} />
          Compare
        </button>
      </div>

      {/* Results */}
      {diffResult && <DiffResults result={diffResult} />}
    </div>
  );
}

import { useState } from 'react';

import { ArrowRight, GitCompare } from 'lucide-react';

import { DiffResults } from './diff-results';
import { SpecSelector } from './spec-selector';
import { diffSpecs } from '../lib/diff-specs';
import type { DiffResult } from '../model/spec-diff-types';
import { useSpec, useSpecHistoryEntries } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

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
            color:
              oldSpecId && newSpecId && oldSpecId !== newSpecId ? '#ffffff' : colors.text.tertiary,
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

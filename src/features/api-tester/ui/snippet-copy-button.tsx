import { Check, Copy } from 'lucide-react';

import type { SnippetParams } from '../lib/snippet-types';
import { type SnippetLang, SNIPPET_LABELS } from '../model/execute-actions.types';
import { useSnippetCopy } from '../model/use-snippet-copy';
import type { SemanticColors } from '@/shared/theme';
import { SegmentedControl, type SegmentItem } from '@/shared/ui/segmented-control';

const SNIPPET_ITEMS: SegmentItem<SnippetLang>[] = [
  { label: 'cURL', value: 'curl' },
  { label: 'JS', value: 'javascript' },
  { label: 'Python', value: 'python' },
];

export function SnippetCopyButton({
  colors,
  disabled,
  snippetParams,
}: {
  colors: SemanticColors;
  disabled: boolean;
  snippetParams: SnippetParams;
}) {
  const { copiedSnippet, snippetLang, handleSelectLang, handleCopySnippet } = useSnippetCopy();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <SegmentedControl<SnippetLang>
        items={SNIPPET_ITEMS}
        value={snippetLang}
        onChange={handleSelectLang}
        disabled={disabled}
        style={{
          padding: '0.4rem',
          backgroundColor: colors.bg.subtle,
          borderRadius: '0.6rem',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: colors.border.default,
        }}
        itemStyle={({ isSelected, disabled: isDisabled }) => ({
          padding: '0.5rem 1rem',
          minWidth: '5rem',
          backgroundColor: isSelected ? colors.bg.overlay : 'transparent',
          borderRadius: '0.2rem',
          color: isDisabled
            ? colors.text.disabled
            : isSelected
              ? colors.text.primary
              : colors.text.tertiary,
          fontSize: '1.2rem',
          fontWeight: 500,
          transition: 'background-color 0.15s ease, color 0.15s ease',
          whiteSpace: 'nowrap' as const,
          boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        })}
      />

      {/* Copy Button */}
      <button
        onClick={() => handleCopySnippet(snippetLang, snippetParams)}
        disabled={disabled}
        title={copiedSnippet ? 'Copied!' : `Copy as ${SNIPPET_LABELS[snippetLang]}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.7rem',
          backgroundColor: disabled
            ? colors.bg.subtle
            : copiedSnippet
              ? colors.feedback.success
              : colors.bg.overlay,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: copiedSnippet ? colors.feedback.success : colors.border.default,
          borderRadius: '0.6rem',
          color: disabled ? colors.text.disabled : copiedSnippet ? '#ffffff' : colors.text.primary,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.1s ease',
          flexShrink: 0,
        }}
      >
        {copiedSnippet ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

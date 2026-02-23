import { Check, ChevronDown, Copy } from 'lucide-react';

import type { SnippetParams } from '../lib/snippet-types';
import { type SnippetLang, SNIPPET_LABELS } from '../model/execute-actions.types';
import { useSnippetCopy } from '../model/use-snippet-copy';
import type { SemanticColors } from '@/shared/theme';

export function SnippetCopyButton({
  colors,
  disabled,
  snippetParams,
}: {
  colors: SemanticColors;
  disabled: boolean;
  snippetParams: SnippetParams;
}) {
  const {
    copiedSnippet,
    snippetLang,
    snippetMenuOpen,
    setSnippetMenuOpen,
    snippetMenuRef,
    handleCopySnippet,
    handleSelectLang,
  } = useSnippetCopy();

  return (
    <div ref={snippetMenuRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex' }}>
        <button
          onClick={() => handleCopySnippet(snippetLang, snippetParams)}
          disabled={disabled}
          title={`Copy as ${SNIPPET_LABELS[snippetLang]}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '1rem 1.4rem',
            backgroundColor: disabled
              ? colors.bg.subtle
              : copiedSnippet
                ? colors.feedback.success
                : colors.bg.overlay,
            color: disabled
              ? colors.text.disabled
              : copiedSnippet
                ? '#ffffff'
                : colors.text.primary,
            border: `1px solid ${copiedSnippet ? colors.feedback.success : colors.border.default}`,
            borderRadius: '0.6rem 0 0 0.6rem',
            borderRight: 'none',
            fontSize: '1.4rem',
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {copiedSnippet ? <Check size={16} /> : <Copy size={16} />}
          {copiedSnippet ? 'Copied!' : SNIPPET_LABELS[snippetLang]}
        </button>
        <button
          onClick={() => setSnippetMenuOpen((prev) => !prev)}
          disabled={disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 0.6rem',
            backgroundColor: disabled ? colors.bg.subtle : colors.bg.overlay,
            color: disabled ? colors.text.disabled : colors.text.primary,
            border: `1px solid ${colors.border.default}`,
            borderRadius: '0 0.6rem 0.6rem 0',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronDown size={14} />
        </button>
      </div>
      {snippetMenuOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '0.4rem',
            backgroundColor: colors.bg.overlay,
            border: `1px solid ${colors.border.default}`,
            borderRadius: '0.6rem',
            overflow: 'hidden',
            zIndex: 20,
            minWidth: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {(['curl', 'javascript', 'python'] as SnippetLang[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleSelectLang(lang, snippetParams)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.8rem 1.4rem',
                backgroundColor: lang === snippetLang ? colors.bg.overlayHover : 'transparent',
                color: colors.text.primary,
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.3rem',
                textAlign: 'left',
                fontWeight: lang === snippetLang ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {SNIPPET_LABELS[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

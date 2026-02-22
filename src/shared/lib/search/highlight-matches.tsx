import type { ReactNode } from 'react';

import { createKoreanSearchRegex } from './korean-search';

export function highlightMatches(
  text: string,
  query: string,
  highlightStyle?: React.CSSProperties,
): ReactNode {
  if (!query || !text) return text;

  const trimmed = query.trim();
  if (!trimmed) return text;

  try {
    const regex = createKoreanSearchRegex(trimmed);
    if (!regex.source || regex.source === '(?:)') return text;

    const globalRegex = new RegExp(regex.source, 'gi');
    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = globalRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <mark
          key={key++}
          style={{
            backgroundColor: 'rgba(250, 204, 21, 0.4)',
            color: 'inherit',
            borderRadius: '2px',
            padding: '0 1px',
            ...highlightStyle,
          }}
        >
          {match[0]}
        </mark>,
      );
      lastIndex = match.index + match[0].length;
      if (match[0].length === 0) {
        globalRegex.lastIndex++;
      }
    }

    if (parts.length === 0) return text;

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
  } catch {
    return text;
  }
}

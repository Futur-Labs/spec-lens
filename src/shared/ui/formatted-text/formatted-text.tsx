import { type CSSProperties, type ReactNode, useMemo } from 'react';

/**
 * 간단한 Markdown 렌더러 (OpenAPI description 용)
 *
 * 지원:
 * - 헤딩 (# ~ ####)
 * - **볼드**, *이탤릭*, `인라인 코드`
 * - [링크](url)
 * - 코드 블록 (```)
 * - 순서 없는 리스트 (- / *)
 * - 순서 있는 리스트 (1. 2. 3.)
 * - 줄바꿈
 */

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const inlineRegex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[([^\]]+)\]\(([^)]+)\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      nodes.push(
        <strong key={match.index} style={{ fontWeight: 600 }}>
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      nodes.push(
        <em key={match.index} style={{ fontStyle: 'italic' }}>
          {match[3]}
        </em>,
      );
    } else if (match[4]) {
      nodes.push(
        <code
          key={match.index}
          style={{
            padding: '0.15em 0.4em',
            borderRadius: '3px',
            backgroundColor: 'rgba(150, 150, 150, 0.15)',
            fontSize: '0.9em',
            fontFamily: 'monospace',
          }}
        >
          {match[4]}
        </code>,
      );
    } else if (match[5] && match[6]) {
      nodes.push(
        <a
          key={match.index}
          href={match[6]}
          target='_blank'
          rel='noopener noreferrer'
          style={{ color: '#3b82f6', textDecoration: 'underline' }}
        >
          {match[5]}
        </a>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderMarkdown(text: string): ReactNode {
  const formatted = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  const lines = formatted.split('\n');
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trimStart().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre
          key={`code-${i}`}
          style={{
            padding: '0.8em 1em',
            borderRadius: '6px',
            backgroundColor: 'rgba(150, 150, 150, 0.1)',
            overflow: 'auto',
            fontSize: '0.9em',
            fontFamily: 'monospace',
            margin: '0.5em 0',
          }}
        >
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const sizes = ['1.4em', '1.25em', '1.1em', '1em'];
      elements.push(
        <div
          key={`h-${i}`}
          style={{
            fontSize: sizes[level - 1],
            fontWeight: 600,
            margin: '0.6em 0 0.3em',
          }}
        >
          {parseInline(headingMatch[2])}
        </div>,
      );
      i++;
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const content = lines[i].replace(/^\s*[-*]\s+/, '');
        items.push(<li key={`ul-${i}`}>{parseInline(content)}</li>);
        i++;
      }
      elements.push(
        <ul key={`list-${i}`} style={{ margin: '0.3em 0', paddingLeft: '1.8em' }}>
          {items}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const content = lines[i].replace(/^\s*\d+\.\s+/, '');
        items.push(<li key={`ol-${i}`}>{parseInline(content)}</li>);
        i++;
      }
      elements.push(
        <ol key={`olist-${i}`} style={{ margin: '0.3em 0', paddingLeft: '1.8em' }}>
          {items}
        </ol>,
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={`br-${i}`} style={{ height: '0.4em' }} />);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <div key={`p-${i}`} style={{ margin: '0.1em 0' }}>
        {parseInline(line)}
      </div>,
    );
    i++;
  }

  return <>{elements}</>;
}

export function FormattedText({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const content = useMemo(() => (text ? renderMarkdown(text) : null), [text]);

  if (!text) return null;

  return (
    <span
      className={className}
      style={{
        wordBreak: 'break-word',
        lineHeight: 1.5,
        ...style,
      }}
    >
      {content}
    </span>
  );
}

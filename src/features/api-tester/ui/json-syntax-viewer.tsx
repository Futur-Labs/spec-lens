import { useState } from 'react';

import { ChevronDown, ChevronRight } from 'lucide-react';

import { useColors } from '@/shared/theme';

type JsonSyntaxViewerProps = {
  data: unknown;
};

export function JsonSyntaxViewer({ data }: JsonSyntaxViewerProps) {
  const colors = useColors();

  // 문자열 데이터는 JSON 파싱 시도
  const parsed = typeof data === 'string' ? tryParseJson(data) : data;

  // JSON이 아닌 경우 일반 텍스트로 표시
  if (parsed === null && typeof data === 'string') {
    return (
      <pre
        style={{
          margin: 0,
          fontSize: '1.2rem',
          fontFamily: 'monospace',
          color: colors.text.primary,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {data}
      </pre>
    );
  }

  return (
    <div
      style={{
        margin: 0,
        fontSize: '1.2rem',
        fontFamily: 'monospace',
        lineHeight: 1.6,
        whiteSpace: 'pre',
      }}
    >
      <JsonNode value={parsed} indent={0} colors={colors} isLast />
    </div>
  );
}

type Colors = ReturnType<typeof useColors>;

function JsonNode({
  value,
  indent,
  colors,
  isLast,
}: {
  value: unknown;
  indent: number;
  colors: Colors;
  isLast: boolean;
}) {
  if (value === null) return <PrimitiveValue text='null' color={colors.feedback.error} isLast={isLast} />;
  if (value === undefined)
    return <PrimitiveValue text='undefined' color={colors.feedback.error} isLast={isLast} />;

  const type = typeof value;
  if (type === 'boolean')
    return <PrimitiveValue text={String(value)} color={colors.feedback.error} isLast={isLast} />;
  if (type === 'number')
    return <PrimitiveValue text={String(value)} color={colors.feedback.warning} isLast={isLast} />;
  if (type === 'string')
    return <StringValue text={value as string} color={colors.feedback.success} isLast={isLast} />;

  if (Array.isArray(value)) {
    return <CollapsibleArray items={value} indent={indent} colors={colors} isLast={isLast} />;
  }

  if (type === 'object') {
    return (
      <CollapsibleObject obj={value as Record<string, unknown>} indent={indent} colors={colors} isLast={isLast} />
    );
  }

  return <PrimitiveValue text={String(value)} color={colors.text.primary} isLast={isLast} />;
}

function PrimitiveValue({ text, color, isLast }: { text: string; color: string; isLast: boolean }) {
  return (
    <span>
      <span style={{ color }}>{text}</span>
      {!isLast && <span style={{ color: 'inherit', opacity: 0.5 }}>,</span>}
    </span>
  );
}

function StringValue({ text, color, isLast }: { text: string; color: string; isLast: boolean }) {
  // URL 감지
  const isUrl = /^https?:\/\//.test(text);
  return (
    <span>
      <span style={{ color }}>
        &quot;
        {isUrl ? (
          <a
            href={text}
            target='_blank'
            rel='noopener noreferrer'
            style={{ color, textDecoration: 'underline', textDecorationColor: `${color}60` }}
          >
            {text}
          </a>
        ) : (
          text
        )}
        &quot;
      </span>
      {!isLast && <span style={{ color: 'inherit', opacity: 0.5 }}>,</span>}
    </span>
  );
}

function CollapsibleObject({
  obj,
  indent,
  colors,
  isLast,
}: {
  obj: Record<string, unknown>;
  indent: number;
  colors: Colors;
  isLast: boolean;
}) {
  const entries = Object.entries(obj);
  const [collapsed, setCollapsed] = useState(false);

  // 빈 객체
  if (entries.length === 0) {
    return (
      <span>
        <span style={{ color: colors.text.tertiary }}>{'{}'}</span>
        {!isLast && <span style={{ opacity: 0.5 }}>,</span>}
      </span>
    );
  }

  const toggleIcon = collapsed ? (
    <ChevronRight size={12} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
  ) : (
    <ChevronDown size={12} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
  );

  if (collapsed) {
    return (
      <span>
        <span
          onClick={() => setCollapsed(false)}
          style={{ cursor: 'pointer', color: colors.text.tertiary }}
        >
          {toggleIcon}
          {'{ '}
          <span style={{ opacity: 0.5 }}>... {entries.length} properties</span>
          {' }'}
        </span>
        {!isLast && <span style={{ opacity: 0.5 }}>,</span>}
      </span>
    );
  }

  const pad = '  '.repeat(indent + 1);
  const closePad = '  '.repeat(indent);

  return (
    <span>
      <span
        onClick={() => setCollapsed(true)}
        style={{ cursor: 'pointer', color: colors.text.tertiary }}
      >
        {toggleIcon}
        {'{'}
      </span>
      {entries.map(([key, val], i) => (
        <span key={key}>
          {'\n'}
          {pad}
          <span style={{ color: colors.feedback.info }}>&quot;{key}&quot;</span>
          <span style={{ color: colors.text.tertiary }}>: </span>
          <JsonNode value={val} indent={indent + 1} colors={colors} isLast={i === entries.length - 1} />
        </span>
      ))}
      {'\n'}
      {closePad}
      <span style={{ color: colors.text.tertiary }}>{'}'}</span>
      {!isLast && <span style={{ opacity: 0.5 }}>,</span>}
    </span>
  );
}

function CollapsibleArray({
  items,
  indent,
  colors,
  isLast,
}: {
  items: unknown[];
  indent: number;
  colors: Colors;
  isLast: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // 빈 배열
  if (items.length === 0) {
    return (
      <span>
        <span style={{ color: colors.text.tertiary }}>{'[]'}</span>
        {!isLast && <span style={{ opacity: 0.5 }}>,</span>}
      </span>
    );
  }

  const toggleIcon = collapsed ? (
    <ChevronRight size={12} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
  ) : (
    <ChevronDown size={12} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
  );

  if (collapsed) {
    return (
      <span>
        <span
          onClick={() => setCollapsed(false)}
          style={{ cursor: 'pointer', color: colors.text.tertiary }}
        >
          {toggleIcon}
          {'[ '}
          <span style={{ opacity: 0.5 }}>... {items.length} items</span>
          {' ]'}
        </span>
        {!isLast && <span style={{ opacity: 0.5 }}>,</span>}
      </span>
    );
  }

  const pad = '  '.repeat(indent + 1);
  const closePad = '  '.repeat(indent);

  return (
    <span>
      <span
        onClick={() => setCollapsed(true)}
        style={{ cursor: 'pointer', color: colors.text.tertiary }}
      >
        {toggleIcon}
        {'['}
      </span>
      {items.map((item, i) => (
        <span key={i}>
          {'\n'}
          {pad}
          <JsonNode value={item} indent={indent + 1} colors={colors} isLast={i === items.length - 1} />
        </span>
      ))}
      {'\n'}
      {closePad}
      <span style={{ color: colors.text.tertiary }}>{']'}</span>
      {!isLast && <span style={{ opacity: 0.5 }}>,</span>}
    </span>
  );
}

function tryParseJson(str: string): unknown | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

import { type CSSProperties } from 'react';

export function FormattedText({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  if (!text) return null;

  const formatted = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

  return (
    <span
      className={className}
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...style,
      }}
    >
      {formatted}
    </span>
  );
}

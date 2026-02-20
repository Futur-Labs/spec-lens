import { useState } from 'react';

import { JsonActionWrapperActions } from './json-action-wrapper-actions';
import { JsonActionWrapperToggleButton } from './json-action-wrapper-toggle-button';
import { stringifyTyped } from '../lib/stringify-typed';
import { useColors } from '@/shared/theme';

export function JsonActionWrapper({
  data,
  typeData,
  children,
  defaultView = 'schema',
}: {
  data?: any;
  typeData?: unknown;
  children: React.ReactNode;
  defaultView?: 'schema' | 'json';
}) {
  const colors = useColors();

  const [view, setView] = useState<'schema' | 'json'>(defaultView);

  const jsonString = typeData
    ? stringifyTyped(typeData)
    : typeof data === 'string'
      ? data
      : JSON.stringify(data, null, 2);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <JsonActionWrapperToggleButton view={view} setView={setView} />

        <JsonActionWrapperActions jsonString={jsonString} />
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: colors.bg.overlay,
          borderRadius: '0.8rem',
          border: `1px solid ${colors.border.subtle}`,
          overflow: 'hidden',
        }}
      >
        {view === 'schema' ? (
          <div style={{ padding: '1.6rem' }}>{children}</div>
        ) : (
          <pre
            style={{
              margin: 0,
              padding: '1.6rem',
              overflow: 'auto',
              fontSize: '1.3rem',
              fontFamily: 'monospace',
              color: colors.text.secondary,
              lineHeight: 1.5,
              maxHeight: '100rem',
            }}
          >
            {jsonString}
          </pre>
        )}
      </div>
    </div>
  );
}

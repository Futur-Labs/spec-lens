import { useState } from 'react';

import { Check, Copy, Loader2, Trash2 } from 'lucide-react';

import { getExecuteStatusColor } from '../config/execute-status-color';
import { getIconButtonStyle } from '../lib/icon-button-style';
import { testParamsStoreActions, useResponse } from '@/entities/test-params';
import { useShowSkeleton } from '@/shared/hooks';
import { formatBytes } from '@/shared/lib';
import { useColors } from '@/shared/theme';

export function ExecuteResponseViewer({
  isExecuting,
  executeError,
}: {
  isExecuting: boolean;
  executeError: string | null;
}) {
  const colors = useColors();
  const iconButtonStyle = getIconButtonStyle(colors);
  const response = useResponse();

  const [copiedResponse, setCopiedResponse] = useState(false);

  const { showSkeleton } = useShowSkeleton(isExecuting, 300);

  if (!showSkeleton && !response) return null;

  function handleCopyResponse() {
    if (response?.data) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  }

  return (
    <>
      {executeError && (
        <div
          style={{
            padding: '1.2rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '0.6rem',
            color: colors.feedback.error,
            fontSize: '1.3rem',
          }}
        >
          Error: {executeError}
        </div>
      )}
      <div
        style={{
          marginTop: '0.8rem',
          border: `1px solid ${colors.border.default}`,
          borderRadius: '0.6rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem 1.2rem',
            backgroundColor: colors.bg.overlay,
            borderBottom: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!response ? (
              <>
                <Loader2 size={14} color={colors.text.secondary} className='animate-spin' />
                <span style={{ fontSize: '1.2rem', color: colors.text.secondary }}>Loading...</span>
              </>
            ) : response ? (
              <>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '1.3rem',
                    color: getExecuteStatusColor(response.status),
                  }}
                >
                  {response.status}
                </span>
                <span style={{ fontSize: '1.2rem', color: colors.text.secondary }}>
                  {response.duration}ms · {formatBytes(response.size)}
                </span>
              </>
            ) : null}
          </div>
          {response && (
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={handleCopyResponse} style={iconButtonStyle}>
                {copiedResponse ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <button onClick={testParamsStoreActions.clearResponse} style={iconButtonStyle}>
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        <div
          style={{
            padding: '1.2rem',
            backgroundColor: 'rgba(0,0,0,0.3)',
            overflow: 'auto',
            height: '300px',
          }}
        >
          {!response ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: colors.text.tertiary,
                fontSize: '1.3rem',
              }}
            >
              Waiting for response...
            </div>
          ) : response ? (
            <pre
              style={{
                margin: 0,
                fontSize: '1.2rem',
                fontFamily: 'monospace',
                color: colors.text.primary,
              }}
            >
              {typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data, null, 2)}
            </pre>
          ) : null}
        </div>
      </div>
    </>
  );
}

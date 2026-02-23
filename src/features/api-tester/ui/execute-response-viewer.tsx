import { useState } from 'react';

import { Check, Copy, Loader2, Trash2 } from 'lucide-react';

import { getStatusCodeColor, getStatusText } from '@/entities/api-spec';
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
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  const { showSkeleton } = useShowSkeleton(isExecuting, 300);

  const headerCount = response?.headers ? Object.keys(response.headers).length : 0;

  if (!showSkeleton && !response) return null;

  function handleCopyResponse() {
    if (!response) return;

    const text =
      activeTab === 'headers' && response.headers
        ? Object.entries(response.headers)
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n')
        : JSON.stringify(response.data, null, 2);

    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  }

  return (
    <>
      {executeError && (
        <div
          style={{
            padding: '1.2rem',
            backgroundColor: `${colors.feedback.error}15`,
            border: `1px solid ${colors.feedback.error}25`,
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
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.2rem 0.8rem',
                    borderRadius: '0.4rem',
                    backgroundColor: `${getStatusCodeColor(response.status)}18`,
                    border: `1px solid ${getStatusCodeColor(response.status)}30`,
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: getStatusCodeColor(response.status),
                  }}
                >
                  {response.status}
                  {getStatusText(response.status) && (
                    <span style={{ fontWeight: 500, marginLeft: '0.4rem', fontSize: '1.1rem' }}>
                      {getStatusText(response.status)}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: '1.2rem', color: colors.text.secondary }}>
                  {response.duration}ms · {formatBytes(response.size)}
                </span>
              </>
            ) : null}
          </div>
          {response && (
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '0.2rem',
                  backgroundColor: colors.bg.base,
                  borderRadius: '0.4rem',
                  padding: '0.2rem',
                }}
              >
                <button
                  onClick={() => setActiveTab('body')}
                  style={{
                    padding: '0.3rem 0.8rem',
                    fontSize: '1.1rem',
                    fontWeight: activeTab === 'body' ? 600 : 400,
                    backgroundColor: activeTab === 'body' ? colors.bg.overlay : 'transparent',
                    color: activeTab === 'body' ? colors.text.primary : colors.text.tertiary,
                    border: 'none',
                    borderRadius: '0.3rem',
                    cursor: 'pointer',
                  }}
                >
                  Body
                </button>
                <button
                  onClick={() => setActiveTab('headers')}
                  style={{
                    padding: '0.3rem 0.8rem',
                    fontSize: '1.1rem',
                    fontWeight: activeTab === 'headers' ? 600 : 400,
                    backgroundColor: activeTab === 'headers' ? colors.bg.overlay : 'transparent',
                    color: activeTab === 'headers' ? colors.text.primary : colors.text.tertiary,
                    border: 'none',
                    borderRadius: '0.3rem',
                    cursor: 'pointer',
                  }}
                >
                  Headers{headerCount > 0 ? ` (${headerCount})` : ''}
                </button>
              </div>
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
            backgroundColor: colors.bg.subtle,
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
          ) : activeTab === 'body' ? (
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
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {response.headers && Object.keys(response.headers).length > 0 ? (
                Object.entries(response.headers).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      gap: '0.8rem',
                      padding: '0.4rem 0',
                      borderBottom: `1px solid ${colors.border.subtle}`,
                      fontSize: '1.2rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span
                      style={{
                        color: colors.feedback.info,
                        fontWeight: 600,
                        minWidth: '18rem',
                        flexShrink: 0,
                      }}
                    >
                      {key}
                    </span>
                    <span
                      style={{
                        color: colors.text.primary,
                        wordBreak: 'break-all',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    color: colors.text.tertiary,
                    fontSize: '1.3rem',
                    textAlign: 'center',
                    padding: '2rem',
                  }}
                >
                  No response headers
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

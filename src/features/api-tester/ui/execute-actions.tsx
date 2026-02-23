import { Loader2, Play } from 'lucide-react';

import type { ExecuteActionsProps } from '../model/execute-actions.types';
import { useExecuteRequest } from '../model/use-execute-request';
import { SnippetCopyButton } from './snippet-copy-button';
import { useColors } from '@/shared/theme';

export function ExecuteActions({
  requestCount,
  requestInterval,
  endpoint,
  jsonError,
}: ExecuteActionsProps) {
  const colors = useColors();
  const {
    selectedServer,
    pathParams,
    queryParams,
    headers,
    requestBody,
    authConfig,
    customCookies,
    isExecuting,
    currentRequestIndex,
    isRepeating,
    handleExecute,
    handleCancelRepeat,
  } = useExecuteRequest(endpoint);

  const snippetParams = {
    baseUrl: selectedServer,
    path: endpoint.path,
    method: endpoint.method,
    pathParams,
    queryParams,
    headers,
    body: requestBody,
    authConfig,
    customCookies,
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: '0.8rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <SnippetCopyButton
          colors={colors}
          disabled={!selectedServer}
          snippetParams={snippetParams}
        />
        {isRepeating && (
          <button
            onClick={handleCancelRepeat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '1rem 2rem',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.6rem',
              fontSize: '1.4rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => handleExecute(requestCount, requestInterval)}
          disabled={isExecuting || !!jsonError}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            padding: '1rem 2.4rem',
            backgroundColor: isExecuting || jsonError ? '#374151' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.6rem',
            fontSize: '1.4rem',
            fontWeight: 600,
            cursor: isExecuting || jsonError ? 'not-allowed' : 'pointer',
          }}
        >
          {isExecuting ? (
            <Loader2 size={16} className='animate-spin' />
          ) : (
            <Play size={16} fill='white' />
          )}
          {isRepeating
            ? `Sending ${currentRequestIndex}/${requestCount}...`
            : isExecuting
              ? 'Sending...'
              : requestCount > 1
                ? `Execute ${requestCount}x`
                : 'Execute Request'}
        </button>
      </div>
    </div>
  );
}

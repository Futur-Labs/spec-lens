import { useState } from 'react';

import { Loader2, Play } from 'lucide-react';

import { executeApiTestRequest } from '../lib/execute-api-test-request';
import { useFileAttachments } from '../model/file-attachments-context';
import { useAuthConfig } from '@/entities/api-auth';
import type { ParsedEndpoint } from '@/entities/api-spec';
import { cookieStoreActions, useCustomCookies } from '@/entities/cookie';
import { historyStoreActions } from '@/entities/history';
import {
  testParamsStoreActions,
  useHeaders,
  useIsExecuting,
  usePathParams,
  useQueryParams,
  useRequestBody,
  useSelectedServer,
} from '@/entities/test-params';

export function ExecuteActions({
  requestCount,
  requestInterval,
  endpoint,
  jsonError,
}: {
  requestCount: number;
  requestInterval: number;
  endpoint: ParsedEndpoint;
  jsonError: string | null;
}) {
  const selectedServer = useSelectedServer();
  const pathParams = usePathParams();
  const queryParams = useQueryParams();
  const headers = useHeaders();
  const requestBody = useRequestBody();
  const authConfig = useAuthConfig();
  const customCookies = useCustomCookies();
  const isExecuting = useIsExecuting();
  const { attachments, toBase64Map } = useFileAttachments();

  const [currentRequestIndex, setCurrentRequestIndex] = useState(0);
  const [isRepeating, setIsRepeating] = useState(false);

  const executeSingleRequest = async () => {
    const startTime = Date.now();

    // multipart + 파일 첨부 시 텍스트 필드와 파일 base64를 merge
    let body = requestBody;
    const isMultipart = headers['Content-Type']?.includes('multipart/form-data');
    if (isMultipart && attachments.size > 0) {
      const fileMap = await toBase64Map();
      let textFields: Record<string, unknown> = {};
      try {
        textFields = JSON.parse(requestBody || '{}');
      } catch {
        // ignore
      }
      body = JSON.stringify({ ...textFields, ...fileMap, __hasFiles: true });
    }

    const result = await executeApiTestRequest({
      baseUrl: selectedServer,
      path: endpoint.path,
      method: endpoint.method,
      pathParams,
      queryParams,
      headers,
      body,
      authConfig,
      customCookies,
    });

    const duration = Date.now() - startTime;

    // Create history entry with extended format
    const historyEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: Date.now(),
      method: endpoint.method,
      url: `${selectedServer}${endpoint.path}`,
      path: endpoint.path,
      request: {
        pathParams,
        queryParams,
        headers,
        body: requestBody,
      },
      response: result.success ? result.response : null,
      error: result.success ? null : result.error,
      duration,
    };

    if (result.success) {
      testParamsStoreActions.setResponse(result.response);

      // Clear session cookies on authentication failure (401 Unauthorized)
      if (result.response.status === 401) {
        cookieStoreActions.clearSessionCookies();
      } else if (result.setCookies && result.setCookies.length > 0) {
        cookieStoreActions.addSessionCookies(result.setCookies);
      }
    } else {
      testParamsStoreActions.setExecuteError(result.error);
    }

    // Save to history
    historyStoreActions.addToHistory(historyEntry);

    return result;
  };

  // Handle execute with repeat support
  const handleExecute = async () => {
    if (!selectedServer) return;

    testParamsStoreActions.setExecuting(true);
    testParamsStoreActions.clearResponse();

    if (requestCount <= 1) {
      // Single request
      await executeSingleRequest();
      testParamsStoreActions.setExecuting(false);
    } else {
      // Multiple requests with interval
      setIsRepeating(true);
      setCurrentRequestIndex(0);

      for (let i = 0; i < requestCount; i++) {
        setCurrentRequestIndex(i + 1);

        await executeSingleRequest();

        // Wait for interval before next request (except for last one)
        if (i < requestCount - 1 && requestInterval > 0) {
          await new Promise((resolve) => setTimeout(resolve, requestInterval));
        }
      }

      setIsRepeating(false);
      setCurrentRequestIndex(0);
      testParamsStoreActions.setExecuting(false);
    }
  };

  // Cancel repeating requests
  const handleCancelRepeat = () => {
    setIsRepeating(false);
    setCurrentRequestIndex(0);
    testParamsStoreActions.setExecuting(false);
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
      {/* Execute buttons */}
      <div style={{ display: 'flex', gap: '0.8rem' }}>
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
          onClick={handleExecute}
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

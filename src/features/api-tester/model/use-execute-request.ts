import { useState } from 'react';

import { executeApiTestRequest } from '../lib/execute-api-test-request';
import { useFileAttachments } from './file-attachments-context';
import { useAuthConfig } from '@/entities/api-auth';
import { useSpecSource, type ParsedEndpoint } from '@/entities/api-spec';
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

export function useExecuteRequest(endpoint: ParsedEndpoint) {
  const selectedServer = useSelectedServer();
  const pathParams = usePathParams();
  const queryParams = useQueryParams();
  const headers = useHeaders();
  const requestBody = useRequestBody();
  const authConfig = useAuthConfig();
  const customCookies = useCustomCookies();
  const isExecuting = useIsExecuting();
  const specSource = useSpecSource();
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

    const historyEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: Date.now(),
      method: endpoint.method,
      url: `${selectedServer}${endpoint.path}`,
      path: endpoint.path,
      summary: endpoint.operation.summary,
      request: {
        pathParams,
        queryParams,
        headers,
        body: requestBody,
      },
      response: result.success ? result.response : null,
      error: result.success ? null : result.error,
      duration,
      specId: specSource?.name,
    };

    if (result.success) {
      testParamsStoreActions.setResponse(result.response);

      if (result.response.status === 401) {
        cookieStoreActions.clearSessionCookies();
      } else if (result.setCookies && result.setCookies.length > 0) {
        cookieStoreActions.addSessionCookies(result.setCookies);
      }
    } else {
      testParamsStoreActions.setExecuteError(result.error);
    }

    historyStoreActions.addToHistory(historyEntry);

    return result;
  };

  const handleExecute = async (requestCount: number, requestInterval: number) => {
    if (!selectedServer) return;

    testParamsStoreActions.setExecuting(true);
    testParamsStoreActions.clearResponse();

    if (requestCount <= 1) {
      await executeSingleRequest();
      testParamsStoreActions.setExecuting(false);
    } else {
      setIsRepeating(true);
      setCurrentRequestIndex(0);

      for (let i = 0; i < requestCount; i++) {
        setCurrentRequestIndex(i + 1);

        await executeSingleRequest();

        if (i < requestCount - 1 && requestInterval > 0) {
          await new Promise((resolve) => setTimeout(resolve, requestInterval));
        }
      }

      setIsRepeating(false);
      setCurrentRequestIndex(0);
      testParamsStoreActions.setExecuting(false);
    }
  };

  const handleCancelRepeat = () => {
    setIsRepeating(false);
    setCurrentRequestIndex(0);
    testParamsStoreActions.setExecuting(false);
  };

  return {
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
  };
}

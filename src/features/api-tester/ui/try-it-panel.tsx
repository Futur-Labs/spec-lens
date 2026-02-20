import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { ChevronDown, Play, Trash2 } from 'lucide-react';

import { AuthCookieStatusBar } from './auth-cookie-status-bar';
import { ExecuteActions } from './execute-actions';
import { ExecuteResponseViewer } from './execute-response-viewer';
import { HeaderEditor } from './header-editor';
import { ParameterEditSection } from './parameter-edit-section';
import { RepeatSettings } from './repeat-settings';
import { RequestBodyEditor } from './request-body-editor';
import { ServerSelector } from './server-selector';
import {
  type ApiSpec,
  type ParameterObject,
  type ParsedEndpoint,
  generateExample,
  getExampleFromMediaType,
  getExampleFromParameter,
  getMergedParameters,
  isReferenceObject,
  useSpecSource,
} from '@/entities/api-spec';
import {
  testParamsStoreActions,
  useExecuteError,
  useHeaders,
  useIsExecuting,
  usePathParams,
  useQueryParams,
  useRequestBody,
  useResponse,
  useSelectedServer,
} from '@/entities/test-params';
import { useColors } from '@/shared/theme';

export function TryItPanel({ endpoint, spec }: { endpoint: ParsedEndpoint; spec: ApiSpec }) {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(true);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Repeat request settings
  const [requestCount, setRequestCount] = useState(1);
  const [requestInterval, setRequestInterval] = useState(0); // ms

  const selectedServer = useSelectedServer();

  const pathParams = usePathParams();
  const queryParams = useQueryParams();
  const headers = useHeaders();
  const requestBody = useRequestBody();
  const response = useResponse();
  const isExecuting = useIsExecuting();
  const executeError = useExecuteError();
  const specSource = useSpecSource();

  // Track previous endpoint for saving params before switch
  const prevEndpointRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  // Derived values
  const specSourceId = specSource?.name || 'default';

  const bodyExample = (() => {
    if (!endpoint.operation.requestBody || isReferenceObject(endpoint.operation.requestBody))
      return '';

    const content = endpoint.operation.requestBody.content?.['application/json'];
    if (content) {
      // Check examples field first (handles both example and examples)
      const mediaTypeExample = getExampleFromMediaType(content);
      if (mediaTypeExample !== null) {
        return typeof mediaTypeExample === 'string'
          ? mediaTypeExample
          : JSON.stringify(mediaTypeExample, null, 2);
      }

      // Fallback: generate from schema
      if (content.schema) {
        const generated = generateExample(content.schema, spec);
        return generated ? JSON.stringify(generated, null, 2) : '';
      }
    }
    return '';
  })();

  // Save params before endpoint change, load saved params for new endpoint
  useEffect(() => {
    const currentEndpointKey = `${endpoint.method}:${endpoint.path}`;

    // Save previous endpoint params (if not initial mount and endpoint changed)
    if (
      !isInitialMount.current &&
      prevEndpointRef.current &&
      prevEndpointRef.current !== currentEndpointKey
    ) {
      testParamsStoreActions.saveCurrentParams(specSourceId, prevEndpointRef.current);
    }

    // Load saved params for current endpoint
    const hasData = testParamsStoreActions.loadSavedParams(specSourceId, currentEndpointKey);

    // If no saved data, reset and initialize with examples from OpenAPI spec
    if (!hasData) {
      testParamsStoreActions.resetParams();
      if (bodyExample) testParamsStoreActions.setRequestBody(bodyExample);

      // Initialize path and query params with examples from OpenAPI spec
      const merged = getMergedParameters(endpoint);
      const params = merged.filter((p): p is ParameterObject => !isReferenceObject(p));
      for (const param of params) {
        const example = getExampleFromParameter(param);
        if (example !== null) {
          const exampleStr = typeof example === 'string' ? example : String(example);
          if (param.in === 'path') {
            testParamsStoreActions.setPathParam(param.name, exampleStr);
          } else if (param.in === 'query') {
            testParamsStoreActions.setQueryParam(param.name, exampleStr);
          }
        }
      }
    }

    prevEndpointRef.current = currentEndpointKey;
    isInitialMount.current = false;
  }, [endpoint.path, endpoint.method, specSourceId, bodyExample, endpoint]);

  // Auto-save params on change (debounced)
  useEffect(() => {
    const endpointKey = `${endpoint.method}:${endpoint.path}`;

    const timeoutId = setTimeout(() => {
      testParamsStoreActions.saveCurrentParams(specSourceId, endpointKey);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    pathParams,
    queryParams,
    headers,
    requestBody,
    response,
    selectedServer,
    endpoint.method,
    endpoint.path,
    specSourceId,
  ]);

  const merged = getMergedParameters(endpoint);
  const parameters = merged.filter((p): p is ParameterObject => !isReferenceObject(p));
  const pathParameters = parameters.filter((p) => p.in === 'path');
  const queryParameters = parameters.filter((p) => p.in === 'query');
  const hasRequestBody = !!endpoint.operation.requestBody;

  function handleClearCurrent() {
    const endpointKey = `${endpoint.method}:${endpoint.path}`;
    testParamsStoreActions.clearEndpointParams(specSourceId, endpointKey);
    if (bodyExample) testParamsStoreActions.setRequestBody(bodyExample);
  }

  return (
    <div
      style={{
        marginTop: '2.4rem',
        backgroundColor: colors.bg.overlay,
        borderRadius: '0.8rem',
        border: `1px solid ${colors.border.subtle}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.4rem 1.6rem',
        }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Play
            size={16}
            fill={colors.text.primary}
            color={colors.text.primary}
            style={{ opacity: 0.8 }}
          />
          <span style={{ color: colors.text.primary, fontSize: '1.4rem', fontWeight: 600 }}>
            Try it out
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ChevronDown size={18} color={colors.text.secondary} />
          </motion.div>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClearCurrent();
          }}
          disabled={isExecuting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.8rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.4rem',
            color: colors.feedback.error,
            fontSize: '1.1rem',
            cursor: isExecuting ? 'not-allowed' : 'pointer',
            opacity: isExecuting ? 0.5 : 1,
          }}
          title='Reset all test data for this endpoint'
        >
          <Trash2 size={10} />
          Reset All
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 1.6rem 1.6rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.6rem',
              }}
            >
              <ServerSelector spec={spec} />

              <AuthCookieStatusBar />

              {(pathParameters.length > 0 || queryParameters.length > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <ParameterEditSection
                    label='PATH PARAMS'
                    parameters={pathParameters}
                    values={pathParams}
                    onChange={(name, v) => testParamsStoreActions.setPathParam(name, v)}
                    onReset={() => testParamsStoreActions.resetPathParams()}
                    resetTitle='Reset path params'
                  />
                  <ParameterEditSection
                    label='QUERY PARAMS'
                    parameters={queryParameters}
                    values={queryParams}
                    onChange={(name, v) => testParamsStoreActions.setQueryParam(name, v)}
                    onReset={() => testParamsStoreActions.resetQueryParams()}
                    resetTitle='Reset query params'
                  />
                </div>
              )}

              <HeaderEditor />

              {hasRequestBody && (
                <RequestBodyEditor
                  bodyExample={bodyExample}
                  jsonError={jsonError}
                  setJsonError={setJsonError}
                />
              )}

              <RepeatSettings
                requestCount={requestCount}
                requestInterval={requestInterval}
                setRequestCount={setRequestCount}
                setRequestInterval={setRequestInterval}
              />

              <ExecuteActions
                requestCount={requestCount}
                requestInterval={requestInterval}
                endpoint={endpoint}
                jsonError={jsonError}
              />

              <ExecuteResponseViewer isExecuting={isExecuting} executeError={executeError} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

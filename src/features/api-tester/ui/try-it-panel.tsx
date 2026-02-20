import { FlexRow } from '@jigoooo/shared-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { ChevronDown, Cookie, Key, Play, Trash2 } from 'lucide-react';

import { ExecuteActions } from './execute-actions';
import { ExecuteResponseViewer } from './execute-response-viewer';
import { HeaderEditor } from './header-editor';
import { RepeatSettings } from './repeat-settings';
import { RequestBodyEditor } from './request-body-editor';
import { ServerSelector } from './server-selector';
import { useAuthConfig } from '@/entities/api-auth';
import {
  type ApiSpec,
  ParameterInput,
  type ParameterObject,
  type ParsedEndpoint,
  generateExample,
  getExampleFromMediaType,
  getExampleFromParameter,
  getMergedParameters,
  isReferenceObject,
  useSpecSource,
} from '@/entities/api-spec';
import { useCustomCookies, useSessionCookies } from '@/entities/cookie';
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
import { ResetButton } from '@/shared/ui/button';

export function TryItPanel({ endpoint, spec }: { endpoint: ParsedEndpoint; spec: ApiSpec }) {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(true);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Repeat request settings
  const [requestCount, setRequestCount] = useState(1);
  const [requestInterval, setRequestInterval] = useState(0); // ms

  const selectedServer = useSelectedServer();
  const authConfig = useAuthConfig();
  const customCookies = useCustomCookies();
  const sessionCookies = useSessionCookies();
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

  // Single request execution

  // Clear current endpoint test data
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

              {/* Auth & Cookies Status (Read-only) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.6rem',
                  padding: '1rem 1.2rem',
                  backgroundColor: colors.bg.overlay,
                  borderRadius: '0.6rem',
                  border: `1px solid ${colors.border.subtle}`,
                }}
              >
                {/* Auth Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Key
                    size={14}
                    color={
                      authConfig.type !== 'none' ? colors.feedback.success : colors.text.secondary
                    }
                  />
                  <span style={{ color: colors.text.secondary, fontSize: '1.2rem' }}>Auth:</span>
                  <span
                    style={{
                      backgroundColor:
                        authConfig.type !== 'none'
                          ? 'rgba(34, 197, 94, 0.2)'
                          : colors.bg.overlayHover,
                      padding: '0.2rem 0.8rem',
                      borderRadius: '1rem',
                      fontSize: '1.1rem',
                      color:
                        authConfig.type !== 'none'
                          ? colors.feedback.success
                          : colors.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {authConfig.type === 'none' ? 'None' : authConfig.type.toUpperCase()}
                  </span>
                </div>

                {/* Separator */}
                <div
                  style={{
                    width: '1px',
                    height: '1.6rem',
                    backgroundColor: colors.border.default,
                  }}
                />

                {/* Cookies Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Cookie
                    size={14}
                    color={
                      customCookies.length + sessionCookies.length > 0
                        ? colors.feedback.warning
                        : colors.text.secondary
                    }
                  />
                  <span style={{ color: colors.text.secondary, fontSize: '1.2rem' }}>Cookies:</span>
                  <span
                    style={{
                      backgroundColor:
                        customCookies.length + sessionCookies.length > 0
                          ? 'rgba(245, 158, 11, 0.2)'
                          : colors.bg.overlayHover,
                      padding: '0.2rem 0.8rem',
                      borderRadius: '1rem',
                      fontSize: '1.1rem',
                      color:
                        customCookies.length + sessionCookies.length > 0
                          ? colors.feedback.warning
                          : colors.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {customCookies.length + sessionCookies.length}
                  </span>
                </div>

                {/* Info text */}
                <span
                  style={{
                    marginLeft: 'auto',
                    color: colors.text.tertiary,
                    fontSize: '1.1rem',
                    fontStyle: 'italic',
                  }}
                >
                  Configure in Global Auth Panel
                </span>
              </div>

              {/* Parameters Group */}
              {(pathParameters.length > 0 || queryParameters.length > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {pathParameters.length > 0 && (
                    <div>
                      <FlexRow
                        style={{
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.8rem',
                        }}
                      >
                        <span
                          style={{
                            color: colors.text.primary,
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            opacity: 0.7,
                          }}
                        >
                          PATH PARAMS
                        </span>
                        {Object.keys(pathParams).length > 0 && (
                          <ResetButton
                            title='Reset path params'
                            onClick={() => testParamsStoreActions.resetPathParams()}
                          />
                        )}
                      </FlexRow>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {pathParameters.map((p) => (
                          <ParameterInput
                            key={p.name}
                            param={p}
                            value={pathParams[p.name] || ''}
                            onChange={(v) => testParamsStoreActions.setPathParam(p.name, v)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {queryParameters.length > 0 && (
                    <div>
                      <FlexRow
                        style={{
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.8rem',
                        }}
                      >
                        <span
                          style={{
                            color: colors.text.primary,
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            opacity: 0.7,
                          }}
                        >
                          QUERY PARAMS
                        </span>
                        {Object.keys(queryParams).length > 0 && (
                          <ResetButton
                            title='Reset query params'
                            onClick={() => testParamsStoreActions.resetQueryParams()}
                          />
                        )}
                      </FlexRow>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {queryParameters.map((p) => (
                          <ParameterInput
                            key={p.name}
                            param={p}
                            value={queryParams[p.name] || ''}
                            onChange={(v) => testParamsStoreActions.setQueryParam(p.name, v)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
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

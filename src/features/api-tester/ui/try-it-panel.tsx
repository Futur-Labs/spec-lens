import { FlexRow } from '@jigoooo/shared-ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import {
  Check,
  ChevronDown,
  ChevronUp,
  Cookie,
  Copy,
  Key,
  Loader2,
  Play,
  Plus,
  Repeat,
  RotateCcw,
  Trash2,
} from 'lucide-react';

import { HeaderAutocompleteInput } from './header-autocomplete-input';
import { VariableAutocompleteInput } from './variable-autocomplete-input';
import {
  apiTesterStoreActions,
  executeRequest,
  getExecuteStatusColor,
  useAuthConfig,
  useCustomCookies,
  useExecuteError,
  useHeaders,
  useIsExecuting,
  usePathParams,
  useQueryParams,
  useRequestBody,
  useResponse,
  useSelectedServer,
  useSessionCookies,
} from '@/entities/api-tester';
import {
  type OpenAPISpec,
  type ParameterObject,
  type ParsedEndpoint,
  generateExample,
  getMergedParameters,
  isReferenceObject,
  useSpecSource,
} from '@/entities/openapi';
import { useShowSkeleton } from '@/shared/hooks';
import { FuturSelect } from '@/shared/ui/select';

const DEFAULT_SERVERS = [{ url: 'http://localhost:3000', description: 'Local' }];

export function TryItPanel({ endpoint, spec }: { endpoint: ParsedEndpoint; spec: OpenAPISpec }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showHeaders, setShowHeaders] = useState(true);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // New header input state
  const [newHeaderName, setNewHeaderName] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  // Repeat request settings
  const [showRepeatSettings, setShowRepeatSettings] = useState(false);
  const [requestCount, setRequestCount] = useState(1);
  const [requestInterval, setRequestInterval] = useState(0); // ms
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0);
  const [isRepeating, setIsRepeating] = useState(false);

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

  // Only show loading UI after 300ms delay
  const { showSkeleton } = useShowSkeleton(isExecuting, 300);

  const servers = spec.servers ?? DEFAULT_SERVERS;

  // Track previous endpoint for saving params before switch
  const prevEndpointRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  // Derived values
  const specSourceId = specSource?.name || 'default';

  const bodyExample = (() => {
    if (!endpoint.operation.requestBody || isReferenceObject(endpoint.operation.requestBody))
      return '';

    const content = endpoint.operation.requestBody.content?.['application/json'];
    if (content?.schema) {
      const example = generateExample(content.schema, spec);
      return example ? JSON.stringify(example, null, 2) : '';
    }
    return '';
  })();

  // Initialize server
  useEffect(() => {
    const serverList = spec.servers ?? DEFAULT_SERVERS;
    if (!selectedServer && serverList.length > 0) {
      apiTesterStoreActions.setSelectedServer(serverList[0].url);
    }
  }, [spec.servers, selectedServer]);

  // Save params before endpoint change, load saved params for new endpoint
  useEffect(() => {
    const currentEndpointKey = `${endpoint.method}:${endpoint.path}`;

    // Save previous endpoint params (if not initial mount and endpoint changed)
    if (
      !isInitialMount.current &&
      prevEndpointRef.current &&
      prevEndpointRef.current !== currentEndpointKey
    ) {
      apiTesterStoreActions.saveCurrentParams(specSourceId, prevEndpointRef.current);
    }

    // Load saved params for current endpoint
    const hasData = apiTesterStoreActions.loadSavedParams(specSourceId, currentEndpointKey);

    // If no saved data, reset and generate example
    if (!hasData) {
      apiTesterStoreActions.resetParams();
      if (bodyExample) apiTesterStoreActions.setRequestBody(bodyExample);
    }

    prevEndpointRef.current = currentEndpointKey;
    isInitialMount.current = false;
  }, [endpoint.path, endpoint.method, specSourceId, bodyExample]);

  // Auto-save params on change (debounced)
  useEffect(() => {
    const endpointKey = `${endpoint.method}:${endpoint.path}`;

    const timeoutId = setTimeout(() => {
      apiTesterStoreActions.saveCurrentParams(specSourceId, endpointKey);
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
  async function executeSingleRequest() {
    const result = await executeRequest({
      baseUrl: selectedServer,
      path: endpoint.path,
      method: endpoint.method,
      pathParams,
      queryParams,
      headers,
      body: requestBody,
      authConfig,
      customCookies,
    });

    if (result.success) {
      apiTesterStoreActions.setResponse(result.response);

      // Clear session cookies on authentication failure (401 Unauthorized)
      if (result.response.status === 401) {
        apiTesterStoreActions.clearSessionCookies();
      } else if (result.setCookies && result.setCookies.length > 0) {
        apiTesterStoreActions.addSessionCookies(result.setCookies);
      }
      apiTesterStoreActions.addToHistory({
        timestamp: Date.now(),
        method: endpoint.method,
        url: `${selectedServer}${endpoint.path}`,
        response: result.response,
        error: null,
      });
    } else {
      apiTesterStoreActions.setExecuteError(result.error);
      apiTesterStoreActions.addToHistory({
        timestamp: Date.now(),
        method: endpoint.method,
        url: `${selectedServer}${endpoint.path}`,
        response: null,
        error: result.error,
      });
    }

    return result;
  }

  // Handle execute with repeat support
  async function handleExecute() {
    if (!selectedServer) return;

    apiTesterStoreActions.setExecuting(true);
    apiTesterStoreActions.clearResponse();

    if (requestCount <= 1) {
      // Single request
      await executeSingleRequest();
      apiTesterStoreActions.setExecuting(false);
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
      apiTesterStoreActions.setExecuting(false);
    }
  }

  // Cancel repeating requests
  function handleCancelRepeat() {
    setIsRepeating(false);
    setCurrentRequestIndex(0);
    apiTesterStoreActions.setExecuting(false);
  }

  function handleCopyResponse() {
    if (response?.data) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  }

  // Clear current endpoint test data
  function handleClearCurrent() {
    const endpointKey = `${endpoint.method}:${endpoint.path}`;
    apiTesterStoreActions.clearEndpointParams(specSourceId, endpointKey);
    if (bodyExample) apiTesterStoreActions.setRequestBody(bodyExample);
  }

  return (
    <div
      style={{
        marginTop: '2.4rem',
        backgroundColor: 'rgba(255,255,255,0.04)', // Matched to EndpointDetail cards
        borderRadius: '0.8rem',
        border: '1px solid rgba(255,255,255,0.08)',
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
          <Play size={16} fill='#f3f4f6' color='#f3f4f6' style={{ opacity: 0.8 }} />
          <span style={{ color: '#f3f4f6', fontSize: '1.4rem', fontWeight: 600 }}>Try it out</span>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ChevronDown size={18} color='#9ca3af' />
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
            color: '#ef4444',
            fontSize: '1.1rem',
            cursor: isExecuting ? 'not-allowed' : 'pointer',
            opacity: isExecuting ? 0.5 : 1,
          }}
          title='Clear all test data for this endpoint'
        >
          <Trash2 size={10} />
          Clear All
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
              {/* Server */}
              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#9ca3af',
                    fontSize: '1.2rem',
                    fontWeight: 500,
                    marginBottom: '0.6rem',
                  }}
                >
                  Target Server
                </label>
                <FuturSelect
                  value={selectedServer}
                  onChange={(val) => apiTesterStoreActions.setSelectedServer(val)}
                  options={servers.map((s) => ({
                    label: `${s.url}${s.description ? ` (${s.description})` : ''}`,
                    value: s.url,
                  }))}
                  placeholder='Select a server'
                />
              </div>

              {/* Auth & Cookies Status (Read-only) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.6rem',
                  padding: '1rem 1.2rem',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '0.6rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Auth Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Key size={14} color={authConfig.type !== 'none' ? '#22c55e' : '#9ca3af'} />
                  <span style={{ color: '#9ca3af', fontSize: '1.2rem' }}>Auth:</span>
                  <span
                    style={{
                      backgroundColor:
                        authConfig.type !== 'none'
                          ? 'rgba(34, 197, 94, 0.2)'
                          : 'rgba(255,255,255,0.1)',
                      padding: '0.2rem 0.8rem',
                      borderRadius: '1rem',
                      fontSize: '1.1rem',
                      color: authConfig.type !== 'none' ? '#22c55e' : '#9ca3af',
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
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }}
                />

                {/* Cookies Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Cookie
                    size={14}
                    color={customCookies.length + sessionCookies.length > 0 ? '#f59e0b' : '#9ca3af'}
                  />
                  <span style={{ color: '#9ca3af', fontSize: '1.2rem' }}>Cookies:</span>
                  <span
                    style={{
                      backgroundColor:
                        customCookies.length + sessionCookies.length > 0
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(255,255,255,0.1)',
                      padding: '0.2rem 0.8rem',
                      borderRadius: '1rem',
                      fontSize: '1.1rem',
                      color:
                        customCookies.length + sessionCookies.length > 0 ? '#f59e0b' : '#9ca3af',
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
                    color: '#6b7280',
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
                            color: '#e5e5e5',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            opacity: 0.7,
                          }}
                        >
                          Path Params
                        </span>
                        <button
                          onClick={() => apiTesterStoreActions.resetPathParams()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#f59e0b',
                            fontSize: '1.1rem',
                            visibility: Object.keys(pathParams).length > 0 ? 'visible' : 'hidden',
                          }}
                          title='Reset path params'
                        >
                          <RotateCcw size={10} />
                          Reset
                        </button>
                      </FlexRow>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {pathParameters.map((p) => (
                          <ParameterInput
                            key={p.name}
                            param={p}
                            value={pathParams[p.name] || ''}
                            onChange={(v) => apiTesterStoreActions.setPathParam(p.name, v)}
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
                            color: '#e5e5e5',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            opacity: 0.7,
                          }}
                        >
                          Query Params
                        </span>
                        <button
                          onClick={() => apiTesterStoreActions.resetQueryParams()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#f59e0b',
                            fontSize: '1.1rem',
                            visibility: Object.keys(queryParams).length > 0 ? 'visible' : 'hidden',
                          }}
                          title='Reset query params'
                        >
                          <RotateCcw size={10} />
                          Reset
                        </button>
                      </FlexRow>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {queryParameters.map((p) => (
                          <ParameterInput
                            key={p.name}
                            param={p}
                            value={queryParams[p.name] || ''}
                            onChange={(v) => apiTesterStoreActions.setQueryParam(p.name, v)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Headers */}
              <div>
                <FlexRow
                  style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.6rem',
                  }}
                >
                  <FlexRow
                    style={{ cursor: 'pointer', alignItems: 'center', gap: '0.8rem' }}
                    onClick={() => setShowHeaders(!showHeaders)}
                  >
                    <span style={{ color: '#9ca3af', fontSize: '1.2rem', fontWeight: 500 }}>
                      Headers
                    </span>
                    <span
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '1rem',
                        fontSize: '1rem',
                        color: '#e5e5e5',
                      }}
                    >
                      {Object.keys(headers).length}
                    </span>
                    {showHeaders ? (
                      <ChevronUp size={12} color='#9ca3af' />
                    ) : (
                      <ChevronDown size={12} color='#9ca3af' />
                    )}
                  </FlexRow>
                  <button
                    onClick={() => apiTesterStoreActions.resetHeaders()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#f59e0b',
                      fontSize: '1.1rem',
                    }}
                    title='Reset headers to default'
                  >
                    <RotateCcw size={10} />
                    Reset
                  </button>
                </FlexRow>
                <AnimatePresence initial={false}>
                  {showHeaders && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {/* Global Auth header indicator */}
                        {authConfig.type !== 'none' && (
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.8rem',
                              alignItems: 'center',
                              padding: '0.6rem 1rem',
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              border: '1px solid rgba(34, 197, 94, 0.2)',
                              borderRadius: '0.6rem',
                            }}
                          >
                            <Key size={12} color='#22c55e' />
                            <span style={{ color: '#22c55e', fontSize: '1.1rem', fontWeight: 500 }}>
                              Authorization
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '1.1rem', flex: 1 }}>
                              (from Global Auth: {authConfig.type.toUpperCase()})
                            </span>
                          </div>
                        )}

                        {/* Existing headers */}
                        {Object.entries(headers).map(([k, v]) => (
                          <div
                            key={k}
                            style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}
                          >
                            <HeaderAutocompleteInput
                              type='name'
                              value={k}
                              onChange={(newKey) => {
                                if (newKey !== k) {
                                  apiTesterStoreActions.removeHeader(k);
                                  apiTesterStoreActions.setHeader(newKey, v);
                                }
                              }}
                              style={{ ...inputStyle, flex: 1 }}
                            />
                            <HeaderAutocompleteInput
                              type='value'
                              headerName={k}
                              value={v}
                              onChange={(newValue) => apiTesterStoreActions.setHeader(k, newValue)}
                              style={{ ...inputStyle, flex: 2 }}
                            />
                            <button
                              onClick={() => apiTesterStoreActions.removeHeader(k)}
                              style={iconButtonStyle}
                              title='Remove header'
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}

                        {/* Add new header form */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.8rem',
                            alignItems: 'center',
                            marginTop: '0.4rem',
                          }}
                        >
                          <HeaderAutocompleteInput
                            type='name'
                            value={newHeaderName}
                            onChange={setNewHeaderName}
                            placeholder='Header name'
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <HeaderAutocompleteInput
                            type='value'
                            headerName={newHeaderName}
                            value={newHeaderValue}
                            onChange={setNewHeaderValue}
                            placeholder='Header value'
                            style={{ ...inputStyle, flex: 2 }}
                          />
                          <button
                            onClick={() => {
                              if (newHeaderName.trim()) {
                                apiTesterStoreActions.setHeader(
                                  newHeaderName.trim(),
                                  newHeaderValue,
                                );
                                setNewHeaderName('');
                                setNewHeaderValue('');
                              }
                            }}
                            disabled={!newHeaderName.trim()}
                            style={{
                              ...iconButtonStyle,
                              backgroundColor: newHeaderName.trim()
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(255,255,255,0.05)',
                              color: newHeaderName.trim() ? '#22c55e' : '#6b7280',
                            }}
                            title='Add header'
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Request Body */}
              {hasRequestBody && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.8rem',
                    }}
                  >
                    <label style={{ color: '#9ca3af', fontSize: '1.2rem', fontWeight: 500 }}>
                      Request Body (JSON)
                    </label>
                    <button
                      onClick={() => {
                        apiTesterStoreActions.setRequestBody(bodyExample);
                      }}
                      title='Reset to default example'
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#f59e0b',
                        fontSize: '1.1rem',
                      }}
                    >
                      <RotateCcw size={10} />
                      Reset
                    </button>
                  </div>
                  <VariableAutocompleteInput
                    value={requestBody}
                    onChange={(value) => {
                      apiTesterStoreActions.setRequestBody(value);
                      if (value.trim()) {
                        try {
                          JSON.parse(value);
                          setJsonError(null);
                        } catch (err) {
                          setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
                        }
                      } else {
                        setJsonError(null);
                      }
                    }}
                    multiline
                    style={{
                      width: '100%',
                      padding: '1.2rem',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      border: `1px solid ${jsonError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '0.6rem',
                      color: '#e5e5e5',
                      fontSize: '1.3rem',
                      fontFamily: 'monospace',
                      resize: 'vertical',
                      outline: 'none',
                      minHeight: '160px',
                    }}
                  />
                  {jsonError && (
                    <div
                      style={{
                        marginTop: '0.6rem',
                        padding: '0.8rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '0.4rem',
                        color: '#ef4444',
                        fontSize: '1.2rem',
                      }}
                    >
                      Invalid JSON: {jsonError}
                    </div>
                  )}
                </div>
              )}

              {/* Repeat Settings */}
              <div>
                <button
                  onClick={() => setShowRepeatSettings(!showRepeatSettings)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.4rem',
                    color: requestCount > 1 ? '#f59e0b' : '#9ca3af',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                  }}
                >
                  <Repeat size={12} />
                  <span>Repeat: {requestCount}x</span>
                  {requestCount > 1 && requestInterval > 0 && (
                    <span style={{ color: '#6b7280' }}>({requestInterval}ms interval)</span>
                  )}
                  {showRepeatSettings ? (
                    <ChevronUp size={12} color='#9ca3af' />
                  ) : (
                    <ChevronDown size={12} color='#9ca3af' />
                  )}
                </button>

                {showRepeatSettings && (
                  <div
                    style={{
                      marginTop: '0.8rem',
                      padding: '1.2rem',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.6rem',
                      display: 'flex',
                      gap: '1.6rem',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: 'block',
                          color: '#9ca3af',
                          fontSize: '1.1rem',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Request Count
                      </label>
                      <NumberInput
                        value={requestCount}
                        onChange={setRequestCount}
                        min={1}
                        max={100}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: 'block',
                          color: '#9ca3af',
                          fontSize: '1.1rem',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Interval (ms)
                      </label>
                      <NumberInput
                        value={requestInterval}
                        onChange={setRequestInterval}
                        min={0}
                        max={60000}
                        step={100}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setRequestCount(1);
                        setRequestInterval(0);
                      }}
                      style={{
                        padding: '0.8rem 1.2rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.4rem',
                        color: '#9ca3af',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                      }}
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
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

              {executeError && (
                <div
                  style={{
                    padding: '1.2rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.6rem',
                    color: '#ef4444',
                    fontSize: '1.3rem',
                  }}
                >
                  Error: {executeError}
                </div>
              )}

              {/* Response area - show only after 300ms loading or when response exists */}
              {(showSkeleton || response) && (
                <div
                  style={{
                    marginTop: '0.8rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.6rem',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '1rem 1.2rem',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {showSkeleton && !response ? (
                        <>
                          <Loader2 size={14} color='#9ca3af' className='animate-spin' />
                          <span style={{ fontSize: '1.2rem', color: '#9ca3af' }}>Loading...</span>
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
                          <span style={{ fontSize: '1.2rem', color: '#9ca3af' }}>
                            {response.duration}ms
                          </span>
                        </>
                      ) : null}
                    </div>
                    {response && (
                      <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button onClick={handleCopyResponse} style={iconButtonStyle}>
                          {copiedResponse ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={apiTesterStoreActions.clearResponse}
                          style={iconButtonStyle}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      padding: '1.2rem',
                      backgroundColor: 'rgba(0,0,0,0.3)', // Darker well transparency instead of solid black
                      overflow: 'auto',
                      height: '300px',
                    }}
                  >
                    {showSkeleton && !response ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          color: '#6b7280',
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
                          color: '#e5e5e5',
                        }}
                      >
                        {typeof response.data === 'string'
                          ? response.data
                          : JSON.stringify(response.data, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputStyle = {
  flex: 1,
  width: '100%',
  padding: '0.8rem 1.2rem',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.6rem',
  color: '#e5e5e5',
  fontSize: '1.3rem',
  outline: 'none',
};

const iconButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.4rem',
  height: '2.4rem',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.4rem',
  color: '#e5e5e5',
  cursor: 'pointer',
};

function ParameterInput({
  param,
  value,
  onChange,
}: {
  param: ParameterObject;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '120px', flexShrink: 0 }}>
        <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: '#e5e5e5' }}>
          {param.name}
        </span>
        {param.required && <span style={{ color: '#ef4444', marginLeft: '0.2rem' }}>*</span>}
      </div>
      <VariableAutocompleteInput
        value={value}
        onChange={onChange}
        placeholder={
          param.description ||
          (param.schema && !isReferenceObject(param.schema) ? String(param.schema.type || '') : '')
        }
        style={inputStyle}
      />
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [inputValue, setInputValue] = useState(String(value));

  // Sync with external value changes
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow empty input for editing
    if (raw === '') {
      setInputValue('');
      return;
    }

    // Remove leading zeros (except for "0" itself)
    const cleaned = raw.replace(/^0+(?=\d)/, '');

    // Only allow digits
    if (!/^\d*$/.test(cleaned)) {
      return;
    }

    setInputValue(cleaned);

    const num = parseInt(cleaned, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    // On blur, ensure we have a valid number
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || inputValue === '') {
      setInputValue(String(min));
      onChange(min);
    } else {
      const clamped = Math.max(min, Math.min(max, num));
      setInputValue(String(clamped));
      onChange(clamped);
    }
  };

  const increment = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
    setInputValue(String(newValue));
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
    setInputValue(String(newValue));
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.6rem',
        overflow: 'hidden',
      }}
    >
      <button
        type='button'
        onClick={decrement}
        disabled={value <= min}
        style={{
          padding: '0.6rem 1rem',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: 'none',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          color: value <= min ? '#4b5563' : '#9ca3af',
          fontSize: '1.4rem',
          cursor: value <= min ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s',
        }}
      >
        −
      </button>
      <input
        type='text'
        inputMode='numeric'
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        style={{
          flex: 1,
          width: '100%',
          minWidth: '60px',
          padding: '0.8rem 1rem',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: 'none',
          color: '#e5e5e5',
          fontSize: '1.3rem',
          textAlign: 'center',
          outline: 'none',
        }}
      />
      <button
        type='button'
        onClick={increment}
        disabled={value >= max}
        style={{
          padding: '0.6rem 1rem',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: 'none',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          color: value >= max ? '#4b5563' : '#9ca3af',
          fontSize: '1.4rem',
          cursor: value >= max ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s',
        }}
      >
        +
      </button>
    </div>
  );
}

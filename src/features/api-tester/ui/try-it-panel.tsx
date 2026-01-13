import { useCallback, useEffect, useState } from 'react';

import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Key,
  Loader2,
  Play,
  RotateCcw,
  Trash2,
} from 'lucide-react';

import {
  apiTesterStoreActions,
  type AuthType,
  executeRequest,
  getExecuteStatusColor,
  useAuthConfig,
  useExecuteError,
  useHeaders,
  useIsExecuting,
  usePathParams,
  useQueryParams,
  useRequestBody,
  useResponse,
  useSelectedServer,
} from '@/entities/api-tester';
import {
  type OpenAPISpec,
  type ParameterObject,
  type ParsedEndpoint,
  generateExample,
  getMergedParameters,
  isReferenceObject,
} from '@/entities/openapi';
import { useShowSkeleton } from '@/shared/hooks';
import { FuturSelect } from '@/shared/ui/select';

export function TryItPanel({ endpoint, spec }: { endpoint: ParsedEndpoint; spec: OpenAPISpec }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const selectedServer = useSelectedServer();
  const authConfig = useAuthConfig();
  const pathParams = usePathParams();
  const queryParams = useQueryParams();
  const headers = useHeaders();
  const requestBody = useRequestBody();
  const response = useResponse();
  const isExecuting = useIsExecuting();
  const executeError = useExecuteError();

  // Only show loading UI after 300ms delay
  const { showSkeleton } = useShowSkeleton(isExecuting, 300);

  const servers = spec.servers || [{ url: 'http://localhost:3000', description: 'Local' }];

  // Initialize server
  useEffect(() => {
    if (!selectedServer && servers.length > 0) {
      apiTesterStoreActions.setSelectedServer(servers[0].url);
    }
  }, [servers, selectedServer]);

  // Generate example
  const generateBodyExample = useCallback(() => {
    if (!endpoint.operation.requestBody || isReferenceObject(endpoint.operation.requestBody))
      return '';

    const content = endpoint.operation.requestBody.content?.['application/json'];
    if (content?.schema) {
      const example = generateExample(content.schema, spec);
      return example ? JSON.stringify(example, null, 2) : '';
    }
    return '';
  }, [endpoint.operation.requestBody, spec]);

  // Reset params & body on endpoint change
  useEffect(() => {
    apiTesterStoreActions.resetParams();
    const example = generateBodyExample();
    if (example) apiTesterStoreActions.setRequestBody(example);
  }, [endpoint.path, endpoint.method, generateBodyExample]);

  const merged = getMergedParameters(endpoint);
  const parameters = merged.filter((p): p is ParameterObject => !isReferenceObject(p));
  const pathParameters = parameters.filter((p) => p.in === 'path');
  const queryParameters = parameters.filter((p) => p.in === 'query');
  const hasRequestBody = !!endpoint.operation.requestBody;

  async function handleExecute() {
    if (!selectedServer) return;
    apiTesterStoreActions.setExecuting(true);
    apiTesterStoreActions.clearResponse();
    const result = await executeRequest({
      baseUrl: selectedServer,
      path: endpoint.path,
      method: endpoint.method,
      pathParams,
      queryParams,
      headers,
      body: requestBody,
      authConfig,
    });
    apiTesterStoreActions.setExecuting(false);

    if (result.success) {
      apiTesterStoreActions.setResponse(result.response);
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
  }

  function handleCopyResponse() {
    if (response?.data) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
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
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.4rem 1.6rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Play size={16} fill='#f3f4f6' color='#f3f4f6' style={{ opacity: 0.8 }} />
          <span style={{ color: '#f3f4f6', fontSize: '1.4rem', fontWeight: 600 }}>Try it out</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} color='#9ca3af' />
        ) : (
          <ChevronDown size={18} color='#9ca3af' />
        )}
      </button>

      {isExpanded && (
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

          {/* Authentication */}
          <div>
            <div
              onClick={() => setShowAuth(!showAuth)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                cursor: 'pointer',
                marginBottom: '0.6rem',
              }}
            >
              <Key size={14} color='#9ca3af' />
              <span style={{ color: '#9ca3af', fontSize: '1.2rem', fontWeight: 500 }}>
                Authentication
              </span>
              <span
                style={{
                  backgroundColor:
                    authConfig.type !== 'none' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  color: authConfig.type !== 'none' ? '#22c55e' : '#9ca3af',
                }}
              >
                {authConfig.type === 'none' ? 'None' : authConfig.type.toUpperCase()}
              </span>
              {showAuth ? (
                <ChevronUp size={12} color='#9ca3af' />
              ) : (
                <ChevronDown size={12} color='#9ca3af' />
              )}
            </div>
            {showAuth && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '0.6rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Auth Type Selection */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#9ca3af',
                      fontSize: '1.1rem',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Type
                  </label>
                  <FuturSelect
                    value={authConfig.type}
                    onChange={(val) =>
                      apiTesterStoreActions.setAuthConfig({ type: val as AuthType })
                    }
                    options={[
                      { label: 'None', value: 'none' },
                      { label: 'Bearer Token', value: 'bearer' },
                      { label: 'API Key', value: 'apiKey' },
                      { label: 'Basic Auth', value: 'basic' },
                    ]}
                  />
                </div>

                {/* Bearer Token */}
                {authConfig.type === 'bearer' && (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#9ca3af',
                        fontSize: '1.1rem',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Token
                    </label>
                    <input
                      type='password'
                      value={authConfig.bearerToken || ''}
                      onChange={(e) =>
                        apiTesterStoreActions.setAuthConfig({ bearerToken: e.target.value })
                      }
                      placeholder='Enter your bearer token'
                      style={inputStyle}
                    />
                  </div>
                )}

                {/* API Key */}
                {authConfig.type === 'apiKey' && (
                  <>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: 'block',
                            color: '#9ca3af',
                            fontSize: '1.1rem',
                            marginBottom: '0.4rem',
                          }}
                        >
                          Key Name
                        </label>
                        <input
                          value={authConfig.apiKeyName || ''}
                          onChange={(e) =>
                            apiTesterStoreActions.setAuthConfig({ apiKeyName: e.target.value })
                          }
                          placeholder='X-API-Key'
                          style={inputStyle}
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
                          Location
                        </label>
                        <FuturSelect
                          value={authConfig.apiKeyLocation || 'header'}
                          onChange={(val) =>
                            apiTesterStoreActions.setAuthConfig({
                              apiKeyLocation: val as 'header' | 'query',
                            })
                          }
                          options={[
                            { label: 'Header', value: 'header' },
                            { label: 'Query Parameter', value: 'query' },
                          ]}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          color: '#9ca3af',
                          fontSize: '1.1rem',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Key Value
                      </label>
                      <input
                        type='password'
                        value={authConfig.apiKeyValue || ''}
                        onChange={(e) =>
                          apiTesterStoreActions.setAuthConfig({ apiKeyValue: e.target.value })
                        }
                        placeholder='Enter your API key'
                        style={inputStyle}
                      />
                    </div>
                  </>
                )}

                {/* Basic Auth */}
                {authConfig.type === 'basic' && (
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: 'block',
                          color: '#9ca3af',
                          fontSize: '1.1rem',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Username
                      </label>
                      <input
                        value={authConfig.basicUsername || ''}
                        onChange={(e) =>
                          apiTesterStoreActions.setAuthConfig({ basicUsername: e.target.value })
                        }
                        placeholder='Username'
                        style={inputStyle}
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
                        Password
                      </label>
                      <input
                        type='password'
                        value={authConfig.basicPassword || ''}
                        onChange={(e) =>
                          apiTesterStoreActions.setAuthConfig({ basicPassword: e.target.value })
                        }
                        placeholder='Password'
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* Persist Session */}
                {authConfig.type !== 'none' && (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      fontSize: '1.2rem',
                    }}
                  >
                    <input
                      type='checkbox'
                      checked={authConfig.persistSession || false}
                      onChange={(e) =>
                        apiTesterStoreActions.setAuthConfig({ persistSession: e.target.checked })
                      }
                      style={{ width: '1.4rem', height: '1.4rem', cursor: 'pointer' }}
                    />
                    Remember credentials
                  </label>
                )}

                {/* Clear Auth Button */}
                {authConfig.type !== 'none' && (
                  <button
                    onClick={() => apiTesterStoreActions.clearAuth()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem 1rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.4rem',
                      color: '#ef4444',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Trash2 size={12} />
                    Clear Authentication
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Parameters Group */}
          {(pathParameters.length > 0 || queryParameters.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {pathParameters.length > 0 && (
                <div>
                  <div
                    style={{
                      color: '#e5e5e5',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      marginBottom: '0.8rem',
                      textTransform: 'uppercase',
                      opacity: 0.7,
                    }}
                  >
                    Path Params
                  </div>
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
                  <div
                    style={{
                      color: '#e5e5e5',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      marginBottom: '0.8rem',
                      textTransform: 'uppercase',
                      opacity: 0.7,
                    }}
                  >
                    Query Params
                  </div>
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
            <div
              onClick={() => setShowHeaders(!showHeaders)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                cursor: 'pointer',
                marginBottom: '0.6rem',
              }}
            >
              <span style={{ color: '#9ca3af', fontSize: '1.2rem', fontWeight: 500 }}>Headers</span>
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
            </div>
            {showHeaders && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {Object.entries(headers).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '0.8rem' }}>
                    <input readOnly value={k} style={inputStyle} />
                    <input
                      value={v}
                      onChange={(e) => apiTesterStoreActions.setHeader(k, e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            )}
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
                    const example = generateBodyExample();
                    apiTesterStoreActions.setRequestBody(example);
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
                    fontSize: '1.2rem',
                  }}
                >
                  <RotateCcw size={12} />
                  Reset to Default
                </button>
              </div>
              <textarea
                value={requestBody}
                onChange={(e) => {
                  const value = e.target.value;
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
                rows={8}
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

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.8rem' }}>
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
              {isExecuting ? 'Sending...' : 'Execute Request'}
            </button>
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
                    <button onClick={apiTesterStoreActions.clearResponse} style={iconButtonStyle}>
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
      )}
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
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          param.description ||
          (param.schema && !isReferenceObject(param.schema) ? String(param.schema.type || '') : '')
        }
        style={inputStyle}
      />
    </div>
  );
}

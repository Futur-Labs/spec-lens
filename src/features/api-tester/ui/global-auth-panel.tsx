import { useEffect, useState } from 'react';

import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Code,
  Cookie,
  History,
  Key,
  Plus,
  Shield,
  Trash2,
  X,
} from 'lucide-react';

import { apiAuthStoreActions, useAuthConfig, type ApiAuthType } from '@/entities/api-auth';
import {
  cookieStoreActions,
  getCookieExpirationInfo,
  useCustomCookies,
  useSessionCookies,
} from '@/entities/cookie';
import { historyStoreActions, useHistory, type HistoryEntry } from '@/entities/history';
import { getMethodColor } from '@/entities/openapi-spec';
import { useVariables, variableStoreActions } from '@/entities/variable';
import { type SemanticColors, useColors } from '@/shared/theme';
import { FuturSelect } from '@/shared/ui/select';

function getInputStyle(colors: SemanticColors) {
  return {
    flex: 1,
    width: '100%',
    padding: '0.8rem 1.2rem',
    backgroundColor: colors.bg.overlay,
    border: `1px solid ${colors.border.default}`,
    borderRadius: '0.6rem',
    color: colors.text.primary,
    fontSize: '1.3rem',
    outline: 'none',
  } as const;
}

export function GlobalAuthPanel() {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'auth' | 'cookies' | 'variables' | 'history'>('auth');

  const authConfig = useAuthConfig();
  const customCookies = useCustomCookies();
  const sessionCookies = useSessionCookies();
  const variables = useVariables();
  const history = useHistory();

  const hasAuth = authConfig.type !== 'none';
  const hasCookies = customCookies.some((c) => c.enabled);
  const hasSessionCookies = sessionCookies.length > 0;
  const hasActiveSession = hasAuth || hasCookies || hasSessionCookies;

  return (
    <div
      style={{
        backgroundColor: colors.bg.overlay,
        borderBottom: `1px solid ${colors.border.subtle}`,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.6rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield
            size={16}
            color={hasActiveSession ? colors.feedback.success : colors.text.tertiary}
            fill={hasActiveSession ? 'rgba(34, 197, 94, 0.2)' : 'transparent'}
          />
          <span style={{ color: colors.text.primary, fontSize: '1.3rem', fontWeight: 500 }}>
            Global Auth & Cookies
          </span>

          {/* Status badges */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {hasAuth && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.2rem 0.6rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  color: '#3b82f6',
                }}
              >
                <Key size={10} />
                {authConfig.type.toUpperCase()}
              </span>
            )}
            {(hasCookies || hasSessionCookies) && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.2rem 0.6rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  color: '#f59e0b',
                }}
              >
                <Cookie size={10} />
                {customCookies.filter((c) => c.enabled).length + sessionCookies.length}
              </span>
            )}
            {variables.length > 0 && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.2rem 0.6rem',
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  color: '#a855f7',
                }}
              >
                <Code size={10} />
                {variables.length}
              </span>
            )}
          </div>
        </div>

        {isExpanded ? (
          <ChevronUp size={16} color={colors.text.secondary} />
        ) : (
          <ChevronDown size={16} color={colors.text.secondary} />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: '0 1.6rem 1.6rem' }}>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              marginBottom: '1.2rem',
              padding: '0.4rem',
              backgroundColor: colors.bg.overlay,
              borderRadius: '0.6rem',
            }}
          >
            <TabButton
              active={activeTab === 'auth'}
              onClick={() => setActiveTab('auth')}
              icon={<Key size={12} />}
              label='Authentication'
            />
            <TabButton
              active={activeTab === 'cookies'}
              onClick={() => setActiveTab('cookies')}
              icon={<Cookie size={12} />}
              label='Cookies'
              count={customCookies.filter((c) => c.enabled).length + sessionCookies.length}
            />
            <TabButton
              active={activeTab === 'variables'}
              onClick={() => setActiveTab('variables')}
              icon={<Code size={12} />}
              label='Variables'
              count={variables.length}
            />
            <TabButton
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              icon={<History size={12} />}
              label='History'
              count={history.length}
            />
          </div>

          {/* Tab Content */}
          {activeTab === 'auth' ? (
            <AuthTab />
          ) : activeTab === 'cookies' ? (
            <CookiesTab />
          ) : activeTab === 'variables' ? (
            <VariablesTab />
          ) : (
            <HistoryTab />
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  const colors = useColors();

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        padding: '1rem 1rem',
        backgroundColor: active ? colors.bg.overlayHover : 'transparent',
        border: 'none',
        borderRadius: '0.4rem',
        color: active ? colors.text.primary : colors.text.secondary,
        fontSize: '1.2rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span
          style={{
            padding: '0.1rem 0.5rem',
            backgroundColor: 'rgba(245, 158, 11, 0.3)',
            borderRadius: '1rem',
            fontSize: '1rem',
            color: colors.feedback.warning,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function AuthTab() {
  const colors = useColors();
  const authConfig = useAuthConfig();
  const inputStyle = getInputStyle(colors);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Auth Type Selection */}
      <div>
        <label
          style={{
            display: 'block',
            color: colors.text.secondary,
            fontSize: '1.1rem',
            marginBottom: '0.4rem',
          }}
        >
          Type
        </label>
        <FuturSelect
          value={authConfig.type}
          onChange={(val) => apiAuthStoreActions.setApiAuthConfig({ type: val as ApiAuthType })}
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
              color: colors.text.secondary,
              fontSize: '1.1rem',
              marginBottom: '0.4rem',
            }}
          >
            Token
          </label>
          <input
            type='password'
            value={authConfig.bearerToken || ''}
            onChange={(e) => apiAuthStoreActions.setApiAuthConfig({ bearerToken: e.target.value })}
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
                  color: colors.text.secondary,
                  fontSize: '1.1rem',
                  marginBottom: '0.4rem',
                }}
              >
                Key Name
              </label>
              <input
                value={authConfig.apiKeyName || ''}
                onChange={(e) =>
                  apiAuthStoreActions.setApiAuthConfig({ apiKeyName: e.target.value })
                }
                placeholder='X-API-Key'
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  color: colors.text.secondary,
                  fontSize: '1.1rem',
                  marginBottom: '0.4rem',
                }}
              >
                Location
              </label>
              <FuturSelect
                value={authConfig.apiKeyLocation || 'header'}
                onChange={(val) =>
                  apiAuthStoreActions.setApiAuthConfig({
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
                color: colors.text.secondary,
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
                apiAuthStoreActions.setApiAuthConfig({ apiKeyValue: e.target.value })
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
                color: colors.text.secondary,
                fontSize: '1.1rem',
                marginBottom: '0.4rem',
              }}
            >
              Username
            </label>
            <input
              value={authConfig.basicUsername || ''}
              onChange={(e) =>
                apiAuthStoreActions.setApiAuthConfig({ basicUsername: e.target.value })
              }
              placeholder='Username'
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                color: colors.text.secondary,
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
                apiAuthStoreActions.setApiAuthConfig({ basicPassword: e.target.value })
              }
              placeholder='Password'
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {/* Persist Session & Clear */}
      {authConfig.type !== 'none' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              color: colors.text.secondary,
              fontSize: '1.2rem',
            }}
          >
            <input
              type='checkbox'
              checked={authConfig.persistSession || false}
              onChange={(e) =>
                apiAuthStoreActions.setApiAuthConfig({ persistSession: e.target.checked })
              }
              style={{ width: '1.4rem', height: '1.4rem', cursor: 'pointer' }}
            />
            Remember credentials
          </label>

          <button
            onClick={() => apiAuthStoreActions.clearAuth()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.4rem',
              color: colors.feedback.error,
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

function CookiesTab() {
  const colors = useColors();
  const customCookies = useCustomCookies();
  const sessionCookies = useSessionCookies();
  const inputStyle = getInputStyle(colors);
  const [newCookieName, setNewCookieName] = useState('');
  const [newCookieValue, setNewCookieValue] = useState('');
  const [, forceUpdate] = useState(0);

  // Auto-check for expired cookies every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const removedCount = cookieStoreActions.removeExpiredCookies();
      if (removedCount > 0) {
        console.log(`[API Tester] Removed ${removedCount} expired session cookie(s)`);
      }
      // Force re-render to update expiration times
      forceUpdate((n) => n + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleAddCookie = () => {
    if (newCookieName.trim() && newCookieValue.trim()) {
      cookieStoreActions.addCustomCookie({
        name: newCookieName.trim(),
        value: newCookieValue.trim(),
        enabled: true,
      });
      setNewCookieName('');
      setNewCookieValue('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Info */}
      <div
        style={{
          padding: '0.8rem 1rem',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '0.6rem',
          fontSize: '1.1rem',
          color: '#93c5fd',
        }}
      >
        💡 Custom cookies will be sent with every API request. Session cookies from login responses
        are automatically managed.
      </div>

      {/* Add New Cookie */}
      <div
        style={{
          display: 'flex',
          gap: '0.8rem',
          padding: '1rem',
          backgroundColor: colors.bg.overlay,
          borderRadius: '0.6rem',
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <input
          value={newCookieName}
          onChange={(e) => setNewCookieName(e.target.value)}
          placeholder='Cookie name'
          style={{ ...inputStyle, flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCookie()}
        />
        <input
          value={newCookieValue}
          onChange={(e) => setNewCookieValue(e.target.value)}
          placeholder='Cookie value'
          style={{ ...inputStyle, flex: 2 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCookie()}
        />
        <button
          onClick={handleAddCookie}
          disabled={!newCookieName.trim() || !newCookieValue.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.8rem 1.2rem',
            backgroundColor:
              newCookieName.trim() && newCookieValue.trim() ? '#2563eb' : colors.bg.overlayHover,
            border: 'none',
            borderRadius: '0.6rem',
            color: colors.text.onBrand,
            fontSize: '1.2rem',
            cursor: newCookieName.trim() && newCookieValue.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {/* Session Cookies from Backend */}
      {sessionCookies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <span style={{ color: colors.text.secondary, fontSize: '1.2rem', fontWeight: 500 }}>
            🔐 Session Cookies (from server)
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              padding: '1rem',
              backgroundColor: 'rgba(34, 197, 94, 0.05)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '0.6rem',
            }}
          >
            {sessionCookies.map((cookie, index) => {
              const expirationInfo = getCookieExpirationInfo(cookie);
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: expirationInfo.isExpiringSoon
                      ? 'rgba(245, 158, 11, 0.1)'
                      : colors.bg.overlay,
                    borderRadius: '0.4rem',
                    border: expirationInfo.isExpiringSoon
                      ? '1px solid rgba(245, 158, 11, 0.3)'
                      : 'none',
                  }}
                >
                  <span
                    style={{
                      color: colors.feedback.success,
                      fontSize: '1.2rem',
                      fontFamily: 'monospace',
                      fontWeight: 500,
                    }}
                  >
                    {cookie.name}
                  </span>
                  <span style={{ color: colors.text.tertiary, fontSize: '1.2rem' }}>=</span>
                  <span
                    style={{
                      flex: 1,
                      color: colors.text.primary,
                      fontSize: '1.2rem',
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={cookie.value}
                  >
                    {cookie.value.length > 50 ? `${cookie.value.slice(0, 50)}...` : cookie.value}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    {/* Expiration badge */}
                    {expirationInfo.expiresIn && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.4rem',
                          backgroundColor: expirationInfo.isExpiringSoon
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(34, 197, 94, 0.2)',
                          borderRadius: '0.3rem',
                          fontSize: '0.9rem',
                          color: expirationInfo.isExpiringSoon
                            ? colors.feedback.warning
                            : colors.feedback.success,
                        }}
                        title={cookie.expires}
                      >
                        {expirationInfo.isExpiringSoon ? (
                          <AlertTriangle size={10} />
                        ) : (
                          <Clock size={10} />
                        )}
                        {expirationInfo.expiresIn}
                      </span>
                    )}
                    {cookie.httpOnly && (
                      <span
                        style={{
                          padding: '0.2rem 0.4rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          borderRadius: '0.3rem',
                          fontSize: '0.9rem',
                          color: '#f87171',
                        }}
                      >
                        HttpOnly
                      </span>
                    )}
                    {cookie.secure && (
                      <span
                        style={{
                          padding: '0.2rem 0.4rem',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          borderRadius: '0.3rem',
                          fontSize: '0.9rem',
                          color: '#60a5fa',
                        }}
                      >
                        Secure
                      </span>
                    )}
                    {cookie.path && (
                      <span
                        style={{
                          padding: '0.2rem 0.4rem',
                          backgroundColor: colors.bg.overlayHover,
                          borderRadius: '0.3rem',
                          fontSize: '0.9rem',
                          color: colors.text.secondary,
                        }}
                      >
                        {cookie.path}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Cookie List */}
      {customCookies.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <span style={{ color: colors.text.secondary, fontSize: '1.2rem', fontWeight: 500 }}>
            🍪 Custom Cookies
          </span>
          {customCookies.map((cookie, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.8rem 1rem',
                backgroundColor: cookie.enabled
                  ? 'rgba(34, 197, 94, 0.05)'
                  : 'rgba(255,255,255,0.02)',
                border: `1px solid ${cookie.enabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '0.6rem',
              }}
            >
              {/* Toggle */}
              <button
                onClick={() =>
                  cookieStoreActions.updateCustomCookie(index, { enabled: !cookie.enabled })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: cookie.enabled
                    ? 'rgba(34, 197, 94, 0.2)'
                    : colors.bg.overlayHover,
                  border: 'none',
                  borderRadius: '0.4rem',
                  cursor: 'pointer',
                }}
              >
                {cookie.enabled ? (
                  <Check size={12} color={colors.feedback.success} />
                ) : (
                  <X size={12} color={colors.text.tertiary} />
                )}
              </button>

              {/* Name */}
              <input
                value={cookie.name}
                onChange={(e) =>
                  cookieStoreActions.updateCustomCookie(index, { name: e.target.value })
                }
                style={{
                  ...inputStyle,
                  flex: 1,
                  fontFamily: 'monospace',
                  opacity: cookie.enabled ? 1 : 0.5,
                }}
              />

              {/* Value */}
              <input
                value={cookie.value}
                onChange={(e) =>
                  cookieStoreActions.updateCustomCookie(index, { value: e.target.value })
                }
                style={{
                  ...inputStyle,
                  flex: 2,
                  fontFamily: 'monospace',
                  opacity: cookie.enabled ? 1 : 0.5,
                }}
              />

              {/* Delete */}
              <button
                onClick={() => cookieStoreActions.removeCustomCookie(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.4rem',
                  cursor: 'pointer',
                  color: colors.feedback.error,
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {/* Clear Custom Cookies */}
          <button
            onClick={() => cookieStoreActions.clearCustomCookies()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.4rem',
              color: colors.feedback.error,
              fontSize: '1.2rem',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            <Trash2 size={12} />
            Clear Custom Cookies
          </button>
        </div>
      ) : (
        sessionCookies.length === 0 && (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: colors.text.tertiary,
              fontSize: '1.2rem',
            }}
          >
            No cookies yet. Add custom cookies above or make API requests to capture session
            cookies.
          </div>
        )
      )}
    </div>
  );
}

function VariablesTab() {
  const colors = useColors();
  const variables = useVariables();
  const inputStyle = getInputStyle(colors);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      variableStoreActions.addVariable({
        name: newName.trim(),
        value: newValue,
      });
      setNewName('');
      setNewValue('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Info */}
      <div
        style={{
          padding: '0.8rem 1rem',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          borderRadius: '0.6rem',
          fontSize: '1.1rem',
          color: '#c4b5fd',
        }}
      >
        💡 Type{' '}
        <code
          style={{
            backgroundColor: colors.bg.overlay,
            padding: '0.2rem 0.4rem',
            borderRadius: '0.3rem',
          }}
        >
          @
        </code>{' '}
        in input fields to autocomplete with variable values.
      </div>

      {/* Add New Variable */}
      <div
        style={{
          display: 'flex',
          gap: '0.8rem',
          padding: '1rem',
          backgroundColor: colors.bg.overlay,
          borderRadius: '0.6rem',
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder='Variable name'
          style={{ ...inputStyle, flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder='Variable value'
          style={{ ...inputStyle, flex: 2 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.8rem 1.2rem',
            backgroundColor: newName.trim() ? '#a855f7' : colors.bg.overlayHover,
            border: 'none',
            borderRadius: '0.6rem',
            color: colors.text.onBrand,
            fontSize: '1.2rem',
            cursor: newName.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {/* Variable List */}
      {variables.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {variables.map((variable, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.8rem 1rem',
                backgroundColor: 'rgba(168, 85, 247, 0.05)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: '0.6rem',
              }}
            >
              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                <span style={{ color: '#a855f7', fontSize: '1.2rem' }}>@</span>
                <input
                  value={variable.name}
                  onChange={(e) =>
                    variableStoreActions.updateVariable(index, { name: e.target.value })
                  }
                  style={{
                    ...inputStyle,
                    fontFamily: 'monospace',
                    backgroundColor: colors.bg.overlay,
                  }}
                />
              </div>

              {/* Value */}
              <input
                value={variable.value}
                onChange={(e) =>
                  variableStoreActions.updateVariable(index, { value: e.target.value })
                }
                placeholder='Value'
                style={{
                  ...inputStyle,
                  flex: 2,
                  backgroundColor: colors.bg.overlay,
                }}
              />

              {/* Delete */}
              <button
                onClick={() => variableStoreActions.removeVariable(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.4rem',
                  cursor: 'pointer',
                  color: colors.feedback.error,
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {/* Clear All Variables */}
          <button
            onClick={() => variableStoreActions.clearVariables()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.4rem',
              color: colors.feedback.error,
              fontSize: '1.2rem',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            <Trash2 size={12} />
            Clear All Variables
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: colors.text.tertiary,
            fontSize: '1.2rem',
          }}
        >
          No variables yet. Add variables above to use them across all endpoints.
        </div>
      )}
    </div>
  );
}

function HistoryTab() {
  const colors = useColors();
  const history = useHistory();

  if (history.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: colors.text.tertiary,
          fontSize: '1.2rem',
        }}
      >
        No request history yet. Make API requests to see them here.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header with Clear All button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: colors.text.secondary, fontSize: '1.2rem' }}>
          Recent Requests ({history.length})
        </span>
        <button
          onClick={() => historyStoreActions.clearHistory()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.4rem',
            color: colors.feedback.error,
            fontSize: '1.1rem',
            cursor: 'pointer',
          }}
        >
          <Trash2 size={12} />
          Clear All
        </button>
      </div>

      {/* History List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {history.map((entry) => (
          <HistoryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const colors = useColors();
  const statusColor = entry.error
    ? colors.feedback.error
    : entry.response?.status && entry.response.status >= 400
      ? colors.feedback.warning
      : colors.feedback.success;

  const formattedTime = new Date(entry.timestamp).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.8rem 1rem',
        backgroundColor: colors.bg.overlay,
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: '0.6rem',
      }}
    >
      {/* Method Badge */}
      <span
        style={{
          padding: '0.2rem 0.6rem',
          backgroundColor: getMethodColor(entry.method),
          borderRadius: '0.3rem',
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.text.onBrand,
          textTransform: 'uppercase',
          minWidth: '4.5rem',
          textAlign: 'center',
        }}
      >
        {entry.method}
      </span>

      {/* Path */}
      <span
        style={{
          flex: 1,
          color: colors.text.primary,
          fontSize: '1.2rem',
          fontFamily: 'monospace',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={entry.url}
      >
        {entry.path}
      </span>

      {/* Status */}
      <span
        style={{
          padding: '0.2rem 0.6rem',
          backgroundColor: `${statusColor}20`,
          borderRadius: '0.3rem',
          fontSize: '1.1rem',
          color: statusColor,
          fontWeight: 500,
        }}
      >
        {entry.error ? 'Error' : entry.response?.status || '-'}
      </span>

      {/* Duration */}
      {entry.duration !== undefined && (
        <span style={{ color: colors.text.tertiary, fontSize: '1.1rem', minWidth: '5rem' }}>
          {entry.duration}ms
        </span>
      )}

      {/* Time */}
      <span style={{ color: colors.text.tertiary, fontSize: '1.1rem', minWidth: '7rem' }}>
        {formattedTime}
      </span>

      {/* Delete Button */}
      <button
        onClick={() => historyStoreActions.removeHistoryEntry(entry.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2rem',
          height: '2rem',
          backgroundColor: 'transparent',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.4rem',
          cursor: 'pointer',
          color: colors.feedback.error,
        }}
        title='Delete'
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

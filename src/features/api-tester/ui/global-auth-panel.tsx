import { useState } from 'react';

import { Check, ChevronDown, ChevronUp, Cookie, Key, Plus, Shield, Trash2, X } from 'lucide-react';

import {
  apiTesterStoreActions,
  type AuthType,
  useAuthConfig,
  useCustomCookies,
} from '@/entities/api-tester';
import { FuturSelect } from '@/shared/ui/select';

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

export function GlobalAuthPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'auth' | 'cookies'>('auth');

  const authConfig = useAuthConfig();
  const customCookies = useCustomCookies();

  const hasAuth = authConfig.type !== 'none';
  const hasCookies = customCookies.some((c) => c.enabled);
  const hasActiveSession = hasAuth || hasCookies;

  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
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
            color={hasActiveSession ? '#22c55e' : '#6b7280'}
            fill={hasActiveSession ? 'rgba(34, 197, 94, 0.2)' : 'transparent'}
          />
          <span style={{ color: '#e5e5e5', fontSize: '1.3rem', fontWeight: 500 }}>
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
            {hasCookies && (
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
                {customCookies.filter((c) => c.enabled).length}
              </span>
            )}
          </div>
        </div>

        {isExpanded ? (
          <ChevronUp size={16} color='#9ca3af' />
        ) : (
          <ChevronDown size={16} color='#9ca3af' />
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
              backgroundColor: 'rgba(0,0,0,0.2)',
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
              count={customCookies.filter((c) => c.enabled).length}
            />
          </div>

          {/* Tab Content */}
          {activeTab === 'auth' ? <AuthTab /> : <CookiesTab />}
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
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        padding: '0.6rem 1rem',
        backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
        border: 'none',
        borderRadius: '0.4rem',
        color: active ? '#e5e5e5' : '#9ca3af',
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
            color: '#f59e0b',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function AuthTab() {
  const authConfig = useAuthConfig();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          onChange={(val) => apiTesterStoreActions.setAuthConfig({ type: val as AuthType })}
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
            onChange={(e) => apiTesterStoreActions.setAuthConfig({ bearerToken: e.target.value })}
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
              onChange={(e) => apiTesterStoreActions.setAuthConfig({ apiKeyValue: e.target.value })}
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

          <button
            onClick={() => apiTesterStoreActions.clearAuth()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.4rem',
              color: '#ef4444',
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
  const customCookies = useCustomCookies();
  const [newCookieName, setNewCookieName] = useState('');
  const [newCookieValue, setNewCookieValue] = useState('');

  const handleAddCookie = () => {
    if (newCookieName.trim() && newCookieValue.trim()) {
      apiTesterStoreActions.addCustomCookie({
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
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderRadius: '0.6rem',
          border: '1px solid rgba(255,255,255,0.08)',
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
              newCookieName.trim() && newCookieValue.trim() ? '#2563eb' : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '0.6rem',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: newCookieName.trim() && newCookieValue.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {/* Cookie List */}
      {customCookies.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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
                  apiTesterStoreActions.updateCustomCookie(index, { enabled: !cookie.enabled })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: cookie.enabled
                    ? 'rgba(34, 197, 94, 0.2)'
                    : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '0.4rem',
                  cursor: 'pointer',
                }}
              >
                {cookie.enabled ? (
                  <Check size={12} color='#22c55e' />
                ) : (
                  <X size={12} color='#6b7280' />
                )}
              </button>

              {/* Name */}
              <input
                value={cookie.name}
                onChange={(e) =>
                  apiTesterStoreActions.updateCustomCookie(index, { name: e.target.value })
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
                  apiTesterStoreActions.updateCustomCookie(index, { value: e.target.value })
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
                onClick={() => apiTesterStoreActions.removeCustomCookie(index)}
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
                  color: '#ef4444',
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {/* Clear All */}
          <button
            onClick={() => apiTesterStoreActions.clearCustomCookies()}
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
            Clear All Cookies
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '1.2rem',
          }}
        >
          No custom cookies. Add one above to include it in API requests.
        </div>
      )}
    </div>
  );
}

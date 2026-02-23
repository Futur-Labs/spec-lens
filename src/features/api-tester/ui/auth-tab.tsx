import { Trash2 } from 'lucide-react';

import { getInputStyle, INPUT_CLASS_NAME } from '../lib/input-style';
import { apiAuthStoreActions, useAuthConfig, type ApiAuthType } from '@/entities/api-auth';
import { useColors } from '@/shared/theme';
import { FuturSelect } from '@/shared/ui/select';

export function AuthTab() {
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
            className={INPUT_CLASS_NAME}
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
                className={INPUT_CLASS_NAME}
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
              className={INPUT_CLASS_NAME}
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
              className={INPUT_CLASS_NAME}
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
              className={INPUT_CLASS_NAME}
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
              border: `1px solid ${colors.feedback.error}40`,
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

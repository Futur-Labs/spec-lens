import { useEffect, useState } from 'react';

import { AlertTriangle, Check, Clock, Plus, Trash2 } from 'lucide-react';

import { getInputStyle, INPUT_CLASS_NAME } from '../lib/input-style';
import {
  cookieStoreActions,
  getCookieExpirationInfo,
  useCustomCookies,
  useSessionCookies,
} from '@/entities/cookie';
import { useColors } from '@/shared/theme';
import { HeadlessCheckbox } from '@/shared/ui/checkbox';

export function CookiesTab() {
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
        // 만료된 쿠키가 있을 때만 리렌더
        forceUpdate((n) => n + 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const isDuplicateCookie =
    newCookieName.trim() !== '' && customCookies.some((c) => c.name === newCookieName.trim());

  const handleAddCookie = () => {
    if (newCookieName.trim() && newCookieValue.trim() && !isDuplicateCookie) {
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
          backgroundColor: `${colors.feedback.success}15`,
          border: `1px solid ${colors.feedback.success}25`,
          borderRadius: '0.6rem',
          fontSize: '1.1rem',
          color: colors.feedback.success,
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
          className={INPUT_CLASS_NAME}
          style={{ ...inputStyle, flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCookie()}
        />
        <input
          value={newCookieValue}
          onChange={(e) => setNewCookieValue(e.target.value)}
          placeholder='Cookie value'
          className={INPUT_CLASS_NAME}
          style={{ ...inputStyle, flex: 2 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCookie()}
        />
        <button
          onClick={handleAddCookie}
          disabled={!newCookieName.trim() || !newCookieValue.trim() || isDuplicateCookie}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.8rem 1.2rem',
            backgroundColor:
              newCookieName.trim() && newCookieValue.trim() && !isDuplicateCookie
                ? colors.feedback.success
                : colors.bg.overlayHover,
            border: 'none',
            borderRadius: '0.6rem',
            color: colors.text.onBrand,
            fontSize: '1.2rem',
            cursor:
              newCookieName.trim() && newCookieValue.trim() && !isDuplicateCookie
                ? 'pointer'
                : 'not-allowed',
          }}
        >
          <Plus size={14} />
          Add
        </button>
      </div>
      {isDuplicateCookie && (
        <span style={{ color: colors.feedback.error, fontSize: '1.1rem' }}>
          Cookie &quot;{newCookieName.trim()}&quot; already exists.
        </span>
      )}

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
              backgroundColor: `${colors.feedback.success}0d`,
              border: `1px solid ${colors.feedback.success}25`,
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
                      ? `${colors.feedback.warning}15`
                      : colors.bg.overlay,
                    borderRadius: '0.4rem',
                    border: expirationInfo.isExpiringSoon
                      ? `1px solid ${colors.feedback.warning}40`
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
                            ? `${colors.feedback.warning}25`
                            : `${colors.feedback.success}25`,
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
                          backgroundColor: `${colors.feedback.error}25`,
                          borderRadius: '0.3rem',
                          fontSize: '0.9rem',
                          color: colors.feedback.error,
                        }}
                      >
                        HttpOnly
                      </span>
                    )}
                    {cookie.secure && (
                      <span
                        style={{
                          padding: '0.2rem 0.4rem',
                          backgroundColor: `${colors.feedback.info}25`,
                          borderRadius: '0.3rem',
                          fontSize: '0.9rem',
                          color: colors.feedback.info,
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
            Custom Cookies
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
                  ? `${colors.feedback.success}0d`
                  : colors.bg.overlay,
                border: `1px solid ${cookie.enabled ? `${colors.feedback.success}25` : colors.border.subtle}`,
                borderRadius: '0.6rem',
              }}
            >
              {/* Toggle */}
              <HeadlessCheckbox
                checked={cookie.enabled}
                onChange={(checked) =>
                  cookieStoreActions.updateCustomCookie(index, { enabled: checked })
                }
              >
                {({ checked }) => (
                  <div
                    style={{
                      width: '1.6rem',
                      height: '1.6rem',
                      borderRadius: '0.3rem',
                      border: checked ? 'none' : `1.5px solid ${colors.border.default}`,
                      backgroundColor: checked ? colors.feedback.success : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    {checked && <Check size={11} color={colors.text.onBrand} strokeWidth={3} />}
                  </div>
                )}
              </HeadlessCheckbox>

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
                  border: `1px solid ${colors.feedback.error}40`,
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
              border: `1px solid ${colors.feedback.error}40`,
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

import { useNavigate } from '@tanstack/react-router';

import { Code, Cookie, Key, Settings, Shield } from 'lucide-react';

import { useAuthConfig } from '@/entities/api-auth';
import { useVariables } from '@/entities/api-spec';
import { useCustomCookies, useSessionCookies } from '@/entities/cookie';
import { useColors } from '@/shared/theme';

export function ApiSettingsModalTrigger() {
  const colors = useColors();
  const navigate = useNavigate();

  const authConfig = useAuthConfig();
  const customCookies = useCustomCookies();
  const sessionCookies = useSessionCookies();
  const variables = useVariables();

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
      <button
        onClick={() => navigate({ to: '/api-docs/settings' })}
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
            API Settings
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

        <Settings size={16} color={colors.text.secondary} />
      </button>
    </div>
  );
}

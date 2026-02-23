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
            fill={hasActiveSession ? `${colors.feedback.success}25` : 'transparent'}
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
                  backgroundColor: `${colors.feedback.info}25`,
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  color: colors.feedback.info,
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
                  backgroundColor: `${colors.feedback.warning}25`,
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  color: colors.feedback.warning,
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
                  backgroundColor: `${colors.accent.purple}25`,
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  color: colors.accent.purple,
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

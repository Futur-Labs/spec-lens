import { Cookie, Key } from 'lucide-react';

import { useAuthConfig } from '@/entities/api-auth';
import { useCustomCookies, useSessionCookies } from '@/entities/cookie';
import { useColors } from '@/shared/theme';

export function AuthCookieStatusBar() {
  const colors = useColors();

  const authConfig = useAuthConfig();
  const customCookies = useCustomCookies();
  const sessionCookies = useSessionCookies();

  return (
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
          color={authConfig.type !== 'none' ? colors.feedback.success : colors.text.secondary}
        />
        <span style={{ color: colors.text.secondary, fontSize: '1.2rem' }}>Auth:</span>
        <span
          style={{
            backgroundColor:
              authConfig.type !== 'none' ? `${colors.feedback.success}25` : colors.bg.overlayHover,
            padding: '0.2rem 0.8rem',
            borderRadius: '1rem',
            fontSize: '1.1rem',
            color: authConfig.type !== 'none' ? colors.feedback.success : colors.text.secondary,
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
                ? `${colors.feedback.warning}25`
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
  );
}

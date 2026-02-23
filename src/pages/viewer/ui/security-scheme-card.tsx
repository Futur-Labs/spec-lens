import { getSecurityIcon, getSecurityTypeLabel } from '../lib/security-helpers';
import type { SecuritySchemeObject } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

export function SecuritySchemeCard({
  name,
  scheme,
  scopes,
}: {
  name: string;
  scheme: SecuritySchemeObject;
  scopes: string[];
}) {
  const colors = useColors();

  return (
    <div
      style={{
        padding: '1rem 1.2rem',
        backgroundColor: colors.bg.overlay,
        borderRadius: '0.6rem',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: colors.border.subtle,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ color: colors.feedback.warning }}>{getSecurityIcon(scheme.type)}</span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            fontWeight: 600,
            color: colors.text.primary,
          }}
        >
          {name}
        </span>
        <span
          style={{
            padding: '0.2rem 0.6rem',
            backgroundColor: `${colors.feedback.warning}18`,
            borderRadius: '0.3rem',
            fontSize: '1rem',
            color: colors.feedback.warning,
            fontWeight: 500,
          }}
        >
          {getSecurityTypeLabel(scheme)}
        </span>
      </div>

      {scheme.description && (
        <p
          style={{
            margin: 0,
            fontSize: '1.2rem',
            color: colors.text.secondary,
            lineHeight: 1.5,
          }}
        >
          {scheme.description}
        </p>
      )}

      {scheme.type === 'oauth2' && scheme.flows && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Object.entries(scheme.flows).map(([flowName, flow]) => {
            if (!flow) return null;
            return (
              <div
                key={flowName}
                style={{
                  padding: '0.6rem 0.8rem',
                  backgroundColor: colors.bg.overlayHover,
                  borderRadius: '0.4rem',
                  fontSize: '1.1rem',
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    color: colors.text.primary,
                    textTransform: 'capitalize',
                  }}
                >
                  {flowName.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {flow.authorizationUrl && (
                  <div style={{ color: colors.text.tertiary, marginTop: '0.3rem' }}>
                    Auth URL:{' '}
                    <span style={{ fontFamily: 'monospace', color: colors.text.secondary }}>
                      {flow.authorizationUrl}
                    </span>
                  </div>
                )}
                {flow.tokenUrl && (
                  <div style={{ color: colors.text.tertiary, marginTop: '0.2rem' }}>
                    Token URL:{' '}
                    <span style={{ fontFamily: 'monospace', color: colors.text.secondary }}>
                      {flow.tokenUrl}
                    </span>
                  </div>
                )}
                {flow.scopes && Object.keys(flow.scopes).length > 0 && (
                  <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {Object.entries(flow.scopes).map(([scope, desc]) => (
                      <span
                        key={scope}
                        title={desc}
                        style={{
                          padding: '0.15rem 0.5rem',
                          backgroundColor: scopes.includes(scope)
                            ? `${colors.feedback.success}25`
                            : colors.bg.overlay,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: scopes.includes(scope)
                            ? `${colors.feedback.success}40`
                            : colors.border.subtle,
                          borderRadius: '0.3rem',
                          fontSize: '1rem',
                          fontFamily: 'monospace',
                          color: scopes.includes(scope)
                            ? colors.feedback.success
                            : colors.text.tertiary,
                          fontWeight: scopes.includes(scope) ? 500 : 400,
                        }}
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { Globe, Key, Lock, Shield } from 'lucide-react';

import type { ApiSpec, OperationObject, SecuritySchemeObject } from '@/entities/api-spec';
import { isReferenceObject } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { CollapsibleSection } from '@/shared/ui/section';

type SecurityRequirement = Record<string, string[]>;

function getSecurityIcon(type: SecuritySchemeObject['type']) {
  switch (type) {
    case 'http':
      return <Shield size={13} />;
    case 'apiKey':
      return <Key size={13} />;
    case 'oauth2':
      return <Globe size={13} />;
    case 'openIdConnect':
      return <Lock size={13} />;
    default:
      return <Shield size={13} />;
  }
}

function getSecurityTypeLabel(scheme: SecuritySchemeObject) {
  switch (scheme.type) {
    case 'http':
      return scheme.scheme === 'bearer'
        ? `Bearer${scheme.bearerFormat ? ` (${scheme.bearerFormat})` : ''}`
        : `HTTP ${scheme.scheme}`;
    case 'apiKey':
      return `API Key (${scheme.in}: ${scheme.name})`;
    case 'oauth2':
      return 'OAuth 2.0';
    case 'openIdConnect':
      return 'OpenID Connect';
    default:
      return scheme.type;
  }
}

function SecuritySchemeCard({
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
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
                            ? 'rgba(34, 197, 94, 0.15)'
                            : colors.bg.overlay,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: scopes.includes(scope)
                            ? 'rgba(34, 197, 94, 0.3)'
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

export function EndpointSecuritySection({
  operation,
  spec,
}: {
  operation: OperationObject;
  spec: ApiSpec;
}) {
  const colors = useColors();

  const securityRequirements: SecurityRequirement[] | undefined =
    operation.security ?? spec.security;

  if (!securityRequirements || !spec.components?.securitySchemes) return null;

  // security: [] means no auth required
  if (securityRequirements.length === 0) {
    return (
      <CollapsibleSection
        title='Security'
        defaultExpanded
        badge={
          <span
            style={{
              padding: '0.2rem 0.6rem',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '0.3rem',
              fontSize: '1rem',
              color: colors.feedback.success,
              fontWeight: 500,
            }}
          >
            None (Public)
          </span>
        }
      >
        <p
          style={{
            margin: 0,
            fontSize: '1.3rem',
            color: colors.text.secondary,
          }}
        >
          This endpoint does not require authentication.
        </p>
      </CollapsibleSection>
    );
  }

  const isGlobal = !operation.security;

  return (
    <CollapsibleSection
      title='Security'
      defaultExpanded
      badge={
        <span
          style={{
            padding: '0.2rem 0.6rem',
            backgroundColor: isGlobal
              ? 'rgba(59, 130, 246, 0.1)'
              : 'rgba(245, 158, 11, 0.1)',
            borderRadius: '0.3rem',
            fontSize: '1rem',
            color: isGlobal ? colors.feedback.info : colors.feedback.warning,
            fontWeight: 500,
          }}
        >
          {isGlobal ? 'Global' : 'Custom'}
        </span>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {securityRequirements.map((requirement, index) => {
          const entries = Object.entries(requirement);

          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {entries.length > 1 && (
                <span
                  style={{
                    fontSize: '1rem',
                    color: colors.text.tertiary,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                  }}
                >
                  All required (AND)
                </span>
              )}
              {entries.map(([schemeName, scopes]) => {
                const schemeRef = spec.components?.securitySchemes?.[schemeName];
                if (!schemeRef || isReferenceObject(schemeRef)) return null;

                return (
                  <SecuritySchemeCard
                    key={schemeName}
                    name={schemeName}
                    scheme={schemeRef}
                    scopes={scopes}
                  />
                );
              })}
              {index < securityRequirements.length - 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '0.2rem 0',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: '1px',
                      backgroundColor: colors.border.subtle,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '1rem',
                      color: colors.text.tertiary,
                      fontWeight: 500,
                    }}
                  >
                    OR
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: '1px',
                      backgroundColor: colors.border.subtle,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

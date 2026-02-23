import { SecuritySchemeCard } from './security-scheme-card';
import type { ApiSpec, OperationObject } from '@/entities/api-spec';
import { isReferenceObject } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { CollapsibleSection } from '@/shared/ui/section';

type SecurityRequirement = Record<string, string[]>;

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

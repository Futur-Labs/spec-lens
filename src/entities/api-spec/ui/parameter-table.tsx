import { getTypeColor } from '../lib/type-color';
import { isReferenceObject, type ParameterObject } from '../model/api-types';
import { useColors, useIsDarkMode } from '@/shared/theme';
import { FormattedText } from '@/shared/ui/formatted-text';

export function ParameterTable({ params }: { params: ParameterObject[] }) {
  const colors = useColors();
  const isDark = useIsDarkMode();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.bg.overlay,
        borderRadius: '0.8rem',
        border: `1px solid ${colors.border.default}`,
        overflow: 'hidden',
      }}
    >
      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(150px, 2fr) 1fr 3fr',
          gap: '1.6rem',
          padding: '1rem 1.6rem',
          backgroundColor: colors.bg.overlay,
          borderBottom: `1px solid ${colors.border.subtle}`,
          color: colors.text.secondary,
          fontSize: '1.1rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <div>Name</div>
        <div style={{ textAlign: 'center' }}>Type</div>
        <div>Description</div>
      </div>

      {/* Table Body */}
      {params.map((param, index) => (
        <div
          key={param.name}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(150px, 2fr) 1fr 3fr',
            gap: '1.6rem',
            padding: '1.2rem 1.6rem',
            borderBottom: index < params.length - 1 ? `1px solid ${colors.border.default}` : 'none',
            fontSize: '1.3rem',
            alignItems: 'start',
          }}
        >
          {/* Name Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  color: colors.text.primary,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              >
                {param.name}
              </span>
              {param.required && (
                <span
                  style={{
                    color: colors.feedback.error,
                    fontWeight: 700,
                    marginLeft: '0.2rem',
                  }}
                >
                  *
                </span>
              )}
            </div>
          </div>

          {/* Type Column */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {param.schema && !isReferenceObject(param.schema) && param.schema.type && (
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: colors.border.subtle,
                  padding: '0.2rem 0.8rem',
                  borderRadius: '1rem',
                  color: getTypeColor(param.schema.type, isDark),
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                {param.schema.type}
              </span>
            )}
          </div>

          {/* Description Column */}
          <div style={{ color: colors.text.secondary, lineHeight: 1.5, fontSize: '1.2rem' }}>
            {param.description ? (
              <FormattedText text={param.description} />
            ) : (
              <span style={{ color: colors.text.tertiary, fontStyle: 'italic' }}>
                No description
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

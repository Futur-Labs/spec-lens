import { generateExample } from '../lib/generate-example.ts';
import { getTypeColor } from '../lib/type-color';
import { type ParameterObject, type OpenAPISpec, isReferenceObject } from '../model/api-types.ts';
import { useColors, useIsDarkMode } from '@/shared/theme';
import { FormattedText } from '@/shared/ui/formatted-text';
import { JsonActionWrapper } from '@/shared/ui/json-action-wrapper';

export function ParameterGroup({
  title,
  params,
  spec,
}: {
  title: string;
  params: ParameterObject[];
  spec: OpenAPISpec;
}) {
  // Generate JSON example for parameters
  const paramExample = params.reduce(
    (acc, param) => {
      if (param.schema && !isReferenceObject(param.schema)) {
        acc[param.name] = generateExample(param.schema, spec) ?? 'string';
      } else {
        acc[param.name] = 'string';
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  const colors = useColors();
  const isDark = useIsDarkMode();

  return (
    <div style={{ marginBottom: '1.6rem' }}>
      <h3
        style={{
          color: colors.text.primary,
          fontSize: '1.2rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
          paddingLeft: '0.8rem',
          borderLeft: `2px solid ${colors.feedback.info}`,
        }}
      >
        {title}
      </h3>
      <JsonActionWrapper data={paramExample}>
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
                borderBottom:
                  index < params.length - 1 ? `1px solid ${colors.border.default}` : 'none',
                fontSize: '1.3rem',
                alignItems: 'start', // Align items to top for multiline descriptions
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
      </JsonActionWrapper>
    </div>
  );
}

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
            <ParameterMeta param={param} colors={colors} />
          </div>

          {/* Type Column */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {param.schema && !isReferenceObject(param.schema) && param.schema.type && (
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: `${getTypeColor(param.schema.type, isDark)}15`,
                  border: `1px solid ${getTypeColor(param.schema.type, isDark)}25`,
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

function ParameterMeta({
  param,
  colors,
}: {
  param: ParameterObject;
  colors: ReturnType<typeof useColors>;
}) {
  const schema = param.schema && !isReferenceObject(param.schema) ? param.schema : null;

  const tags: { label: string; color: string }[] = [];

  // in location
  if (param.in) {
    tags.push({ label: param.in, color: '#6366f1' }); // indigo
  }

  if (!schema) {
    if (tags.length === 0) return null;
    return <MetaTagRow tags={tags} />;
  }

  // format
  if (schema.format) {
    tags.push({ label: schema.format, color: '#8b5cf6' }); // violet
  }

  // default
  if (schema.default !== undefined) {
    tags.push({ label: `default: ${schema.default}`, color: colors.text.tertiary });
  }

  // min/max (number)
  if (schema.minimum !== undefined || schema.maximum !== undefined) {
    const parts = [
      schema.minimum !== undefined ? `min:${schema.minimum}` : null,
      schema.maximum !== undefined ? `max:${schema.maximum}` : null,
    ].filter(Boolean);
    tags.push({ label: `[${parts.join(', ')}]`, color: colors.text.tertiary });
  }

  // minLength/maxLength (string)
  if (schema.minLength !== undefined || schema.maxLength !== undefined) {
    const parts = [
      schema.minLength !== undefined ? `min:${schema.minLength}` : null,
      schema.maxLength !== undefined ? `max:${schema.maxLength}` : null,
    ].filter(Boolean);
    tags.push({ label: `len[${parts.join(', ')}]`, color: colors.text.tertiary });
  }

  // pattern
  if (schema.pattern) {
    tags.push({ label: `regex: ${schema.pattern}`, color: colors.text.tertiary });
  }

  if (tags.length === 0 && !schema.enum) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {tags.length > 0 && <MetaTagRow tags={tags} />}
      {schema.enum && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {schema.enum.map((value, i) => (
            <span
              key={i}
              style={{
                padding: '0.1rem 0.6rem',
                borderRadius: '0.2rem',
                fontSize: '1rem',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                color: '#fbbf24',
                border: '1px solid rgba(251, 191, 36, 0.2)',
              }}
            >
              {String(value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MetaTagRow({ tags }: { tags: { label: string; color: string }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
      {tags.map((tag, i) => (
        <span
          key={i}
          title={tag.label}
          style={{
            fontSize: '1rem',
            fontFamily: 'monospace',
            color: tag.color,
            backgroundColor: `${tag.color}10`,
            padding: '0.1rem 0.5rem',
            borderRadius: '0.2rem',
            maxWidth: '14rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}

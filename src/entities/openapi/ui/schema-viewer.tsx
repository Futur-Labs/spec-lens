import { useState } from 'react';

import { ChevronDown, ChevronRight, Info } from 'lucide-react';

import { resolveSchema } from '../lib/openapi-parser.ts';
import {
  isReferenceObject,
  type OpenAPISpec,
  type ReferenceObject,
  type SchemaObject,
} from '../model/openapi-types';

export function SchemaViewer({
  schema,
  spec,
  name,
  depth = 0,
  required = false,
}: {
  schema: SchemaObject | ReferenceObject;
  spec: OpenAPISpec;
  name?: string;
  depth?: number;
  required?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [isHovered, setIsHovered] = useState(false);

  const resolvedSchema = isReferenceObject(schema) ? resolveSchema(schema, spec) : schema;

  if (!resolvedSchema) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          color: '#ef4444',
          fontSize: '1.2rem',
          padding: '0.4rem 0',
        }}
      >
        <Info size={14} />
        <span>Unable to resolve schema: {isReferenceObject(schema) ? schema.$ref : 'unknown'}</span>
      </div>
    );
  }

  const refName = isReferenceObject(schema) ? schema.$ref.split('/').pop() : null;
  const hasChildren =
    resolvedSchema.type === 'object' ||
    resolvedSchema.type === 'array' ||
    resolvedSchema.allOf ||
    resolvedSchema.oneOf ||
    resolvedSchema.anyOf;

  const getTypeDisplay = (s: SchemaObject): string => {
    if (s.type === 'array' && s.items) {
      const itemSchema = isReferenceObject(s.items) ? resolveSchema(s.items, spec) : s.items;
      if (itemSchema) {
        return `array<${getTypeDisplay(itemSchema)}>`;
      }
      return 'array';
    }
    if (s.enum) {
      return `enum`;
    }
    return s.type || 'any';
  };

  const typeDisplay = getTypeDisplay(resolvedSchema);
  const typeColor = getTypeColor(resolvedSchema.type);

  // Styles based on 10px rem (e.g., 1.4rem = 14px)
  const styles = {
    container: {
      marginLeft: depth > 0 ? '1.6rem' : 0,
      paddingLeft: depth > 0 ? '1.2rem' : 0,
      borderLeft: depth > 0 ? '1px solid #e5e7eb' : 'none', // gray-200
      fontSize: '1.4rem',
      position: 'relative' as const,
    },
    row: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.8rem',
      padding: '0.6rem 0',
      cursor: hasChildren ? 'pointer' : 'default',
      transition: 'background-color 0.2s',
      borderRadius: '0.4rem',
      backgroundColor: isHovered && hasChildren ? '#f9fafb' : 'transparent', // hover: gray-50
    },
    chevron: {
      marginTop: '0.2rem',
      flexShrink: 0,
      color: '#9ca3af', // gray-400
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
    header: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      alignItems: 'center',
      gap: '0.8rem',
      rowGap: '0.4rem',
    },
    name: {
      fontFamily: 'monospace',
      fontSize: '1.4rem',
      fontWeight: 500,
      color: '#111827', // gray-900
    },
    required: {
      color: '#ef4444', // red-500
      marginLeft: '0.2rem',
    },
    typeInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem',
      fontSize: '1.2rem',
      fontFamily: 'monospace',
    },
    typeText: {
      color: typeColor,
      fontWeight: 500,
    },
    refName: {
      color: '#6366f1', // indigo-500
    },
    nullable: {
      padding: '0.2rem 0.6rem',
      fontSize: '1rem',
      textTransform: 'uppercase' as const,
      fontWeight: 'bold' as const,
      color: '#6b7280', // gray-500
      backgroundColor: '#f3f4f6', // gray-100
      borderRadius: '0.2rem',
    },
    validation: {
      fontSize: '1rem',
      color: '#6b7280', // gray-500
    },
    description: {
      marginTop: '0.4rem',
      fontSize: '1.2rem',
      color: '#6b7280', // gray-500
      lineHeight: 1.5,
    },
    enumContainer: {
      marginTop: '0.6rem',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.6rem',
    },
    enumBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.8rem',
      borderRadius: '0.2rem',
      fontSize: '1rem',
      fontFamily: 'monospace',
      backgroundColor: '#fffbeb', // yellow-50
      color: '#b45309', // yellow-700
      border: '1px solid #fef3c7', // yellow-100
    },
  };

  return (
    <div style={styles.container}>
      <div
        style={styles.row}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={styles.chevron}>
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )
          ) : (
            <div style={{ width: 16 }} />
          )}
        </div>

        <div style={styles.content}>
          <div style={styles.header}>
            {name && (
              <span style={styles.name}>
                {name}
                {required && <span style={styles.required}>*</span>}
              </span>
            )}

            <div style={styles.typeInfo}>
              <span style={styles.typeText}>{typeDisplay}</span>
              {refName && <span style={styles.refName}>({refName})</span>}
            </div>

            {resolvedSchema.nullable && <span style={styles.nullable}>Nullable</span>}

            {/* Validations */}
            {(resolvedSchema.minLength !== undefined || resolvedSchema.maxLength !== undefined) && (
              <span style={styles.validation}>
                [
                {[
                  resolvedSchema.minLength !== undefined && `min:${resolvedSchema.minLength}`,
                  resolvedSchema.maxLength !== undefined && `max:${resolvedSchema.maxLength}`,
                ]
                  .filter(Boolean)
                  .join(', ')}
                ]
              </span>
            )}
            {(resolvedSchema.minimum !== undefined || resolvedSchema.maximum !== undefined) && (
              <span style={styles.validation}>
                [
                {[
                  resolvedSchema.minimum !== undefined && `min:${resolvedSchema.minimum}`,
                  resolvedSchema.maximum !== undefined && `max:${resolvedSchema.maximum}`,
                ]
                  .filter(Boolean)
                  .join(', ')}
                ]
              </span>
            )}
            {resolvedSchema.pattern && (
              <span
                style={{
                  ...styles.validation,
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={resolvedSchema.pattern}
              >
                regex: {resolvedSchema.pattern}
              </span>
            )}
          </div>

          {resolvedSchema.description && (
            <div style={styles.description}>{resolvedSchema.description}</div>
          )}

          {resolvedSchema.enum && (
            <div style={styles.enumContainer}>
              {resolvedSchema.enum.map((value, i) => (
                <span key={i} style={styles.enumBadge}>
                  {String(value)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div style={{ marginTop: '0.4rem', marginBottom: '0.8rem' }}>
          {resolvedSchema.properties &&
            Object.entries(resolvedSchema.properties).map(([propName, propSchema], i, arr) => (
              <SchemaViewer
                key={propName}
                name={propName}
                schema={propSchema}
                spec={spec}
                depth={depth + 1}
                required={resolvedSchema.required?.includes(propName)}
                isLast={i === arr.length - 1}
              />
            ))}

          {resolvedSchema.type === 'array' && resolvedSchema.items && (
            <SchemaViewer
              name='items'
              schema={resolvedSchema.items}
              spec={spec}
              depth={depth + 1}
              isLast={true}
            />
          )}

          {resolvedSchema.allOf &&
            resolvedSchema.allOf.map((subSchema, i) => (
              <SchemaViewer
                key={`allOf-${i}`}
                name={`allOf[${i}]`}
                schema={subSchema}
                spec={spec}
                depth={depth + 1}
              />
            ))}

          {resolvedSchema.oneOf &&
            resolvedSchema.oneOf.map((subSchema, i) => (
              <SchemaViewer
                key={`oneOf-${i}`}
                name={`oneOf[${i}]`}
                schema={subSchema}
                spec={spec}
                depth={depth + 1}
              />
            ))}

          {resolvedSchema.anyOf &&
            resolvedSchema.anyOf.map((subSchema, i) => (
              <SchemaViewer
                key={`anyOf-${i}`}
                name={`anyOf[${i}]`}
                schema={subSchema}
                spec={spec}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function getTypeColor(type?: string): string {
  switch (type) {
    case 'string':
      return '#059669'; // emerald-600
    case 'number':
    case 'integer':
      return '#2563eb'; // blue-600
    case 'boolean':
      return '#d97706'; // amber-600
    case 'array':
      return '#7c3aed'; // violet-600
    case 'object':
      return '#db2777'; // pink-600
    default:
      return '#6b7280'; // gray-500
  }
}

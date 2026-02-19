import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import { ChevronDown, Info } from 'lucide-react';

import { hasChildrenCondition } from '../lib/has-children.ts';
import { resolveSchema } from '../lib/resolve-schema.ts';
import { getTypeDisplay } from '../lib/type-display.ts';
import {
  isReferenceObject,
  type ApiSpec,
  type ReferenceObject,
  type SchemaObject,
} from '../model/api-types.ts';
import { useSchemaViewerStyles } from '../model/use-schema-viewer-styles.ts';
import { useColors } from '@/shared/theme';
import { FormattedText } from '@/shared/ui/formatted-text';

export function SchemaViewer({
  schema,
  spec,
  name,
  depth = 0,
  required = false,
}: {
  schema: SchemaObject | ReferenceObject;
  spec: ApiSpec;
  name?: string;
  depth?: number;
  required?: boolean;
}) {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [isHovered, setIsHovered] = useState(false);

  const resolvedSchema = isReferenceObject(schema) ? resolveSchema(schema, spec) : schema;
  const refName = isReferenceObject(schema) ? schema.$ref.split('/').pop() : null;
  const hasChildren = hasChildrenCondition(resolvedSchema);
  const typeDisplay = getTypeDisplay(resolvedSchema, spec);

  const schemaViewerStyles = useSchemaViewerStyles({
    resolvedSchema,
    depth,
    isHovered,
  });

  if (!resolvedSchema) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          color: colors.feedback.error,
          fontSize: '1.2rem',
          padding: '0.4rem 0',
        }}
      >
        <Info size={14} />
        <span>Unable to resolve schema: {isReferenceObject(schema) ? schema.$ref : 'unknown'}</span>
      </div>
    );
  }

  return (
    <div style={schemaViewerStyles.container}>
      <div
        style={schemaViewerStyles.row}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={schemaViewerStyles.chevron}>
          {hasChildren ? (
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <ChevronDown size={16} />
            </motion.div>
          ) : (
            <div style={{ width: 16 }} />
          )}
        </div>

        <div style={schemaViewerStyles.content}>
          <div style={schemaViewerStyles.header}>
            {name && (
              <span style={schemaViewerStyles.name}>
                {name}
                {required && <span style={schemaViewerStyles.requiredMark}>*</span>}
              </span>
            )}

            <div style={schemaViewerStyles.typeInfo}>
              <span style={schemaViewerStyles.typeBadge}>
                <span style={schemaViewerStyles.typeText}>{typeDisplay}</span>
              </span>
              {refName && <span style={schemaViewerStyles.refName}>({refName})</span>}
            </div>

            {/* Validations */}
            {(resolvedSchema.minLength !== undefined || resolvedSchema.maxLength !== undefined) && (
              <span style={schemaViewerStyles.validation}>
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
              <span style={schemaViewerStyles.validation}>
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
                  ...schemaViewerStyles.validation,
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
            <div style={schemaViewerStyles.description}>
              <FormattedText text={resolvedSchema.description} />
            </div>
          )}

          {resolvedSchema.enum && (
            <div style={schemaViewerStyles.enumContainer}>
              {resolvedSchema.enum.map((value, i) => (
                <span key={i} style={schemaViewerStyles.enumBadge}>
                  {String(value)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: '0.4rem', marginBottom: '0.8rem' }}>
              {resolvedSchema.properties &&
                Object.entries(resolvedSchema.properties).map(([propName, propSchema]) => (
                  <SchemaViewer
                    key={propName}
                    name={propName}
                    schema={propSchema}
                    spec={spec}
                    depth={depth + 1}
                    required={resolvedSchema.required?.includes(propName)}
                  />
                ))}

              {resolvedSchema.type === 'array' && resolvedSchema.items && (
                <SchemaViewer
                  name='items'
                  schema={resolvedSchema.items}
                  spec={spec}
                  depth={depth + 1}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

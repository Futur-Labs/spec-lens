import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { Info } from 'lucide-react';

import { SchemaNodeRow } from './schema-node-row.tsx';
import { hasChildrenCondition } from '../lib/has-children.ts';
import { resolveSchema } from '../lib/resolve-schema.ts';
import { getTypeDisplay } from '../lib/type-display.ts';
import {
  isReferenceObject,
  type ApiSpec,
  type ReferenceObject,
  type SchemaObject,
} from '../model/api-types.ts';
import { useSchemaContainerStyle } from '../model/use-schema-viewer-styles.ts';
import { useColors } from '@/shared/theme';

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

  const resolvedSchema = isReferenceObject(schema) ? resolveSchema(schema, spec) : schema;
  const refName = isReferenceObject(schema) ? schema.$ref.split('/').pop() : null;
  const hasChildren = hasChildrenCondition(resolvedSchema);
  const typeDisplay = getTypeDisplay(resolvedSchema, spec);

  const containerStyle = useSchemaContainerStyle({ depth });

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
    <div style={containerStyle}>
      <SchemaNodeRow
        name={name}
        required={required}
        typeDisplay={typeDisplay}
        refName={refName}
        resolvedSchema={resolvedSchema}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

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

import { motion } from 'framer-motion';
import { useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { hasChildrenCondition } from '../lib/has-children.ts';
import type { SchemaObject } from '../model/api-types.ts';
import { useSchemaNodeRowStyles } from '../model/use-schema-viewer-styles.ts';
import { FormattedText } from '@/shared/ui/formatted-text';

export function SchemaNodeRow({
  name,
  required,
  typeDisplay,
  refName,
  resolvedSchema,
  isExpanded,
  onToggle,
}: {
  name?: string;
  required?: boolean;
  typeDisplay: string;
  refName: string | null | undefined;
  resolvedSchema: SchemaObject;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = !!hasChildrenCondition(resolvedSchema);

  const styles = useSchemaNodeRowStyles({
    resolvedSchema,
    isHovered,
  });

  return (
    <div
      style={styles.row}
      onClick={() => hasChildren && onToggle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.chevron}>
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

      <div style={styles.content}>
        <div style={styles.header}>
          {name && (
            <span style={styles.name}>
              {name}
              {required && <span style={styles.requiredMark}>*</span>}
            </span>
          )}

          <div style={styles.typeInfo}>
            <span style={styles.typeBadge}>
              <span style={styles.typeText}>{typeDisplay}</span>
            </span>
            {refName && <span style={styles.refName}>({refName})</span>}
          </div>

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
          <div style={styles.description}>
            <FormattedText text={resolvedSchema.description} />
          </div>
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
  );
}

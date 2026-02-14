import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { SchemaViewer } from './schema-viewer.tsx';
import { generateExample, getExampleFromMediaType } from '../lib/generate-example.ts';
import { getStatusCodeColor } from '../lib/status-code-color';
import { type ResponseObject, type OpenAPISpec } from '../model/api-types.ts';
import { useColors } from '@/shared/theme';
import { FormattedText } from '@/shared/ui/formatted-text';
import { JsonActionWrapper } from '@/shared/ui/json-action-wrapper';

export function ResponseItem({
  statusCode,
  response,
  schema,
  spec,
}: {
  statusCode: string;
  response: ResponseObject;
  schema: any;
  spec: OpenAPISpec;
}) {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(statusCode.startsWith('2'));

  const statusColor = getStatusCodeColor(statusCode);

  return (
    <div
      style={{
        backgroundColor: colors.bg.overlay,
        borderRadius: '0.8rem',
        border: `1px solid ${colors.border.subtle}`,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '1.6rem',
          padding: '1.2rem 1.6rem',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          backgroundColor: colors.bg.overlay,
        }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          <ChevronDown
            size={14}
            color={isExpanded ? colors.text.secondary : colors.text.tertiary}
          />
        </motion.div>

        <span
          style={{
            backgroundColor: `${statusColor}20`, // 20% opacity of status color
            color: statusColor,
            fontSize: '1.3rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            padding: '0.3rem 0.8rem',
            borderRadius: '0.6rem',
            border: `1px solid ${statusColor}40`,
            minWidth: '6rem',
            textAlign: 'center',
          }}
        >
          {statusCode}
        </span>

        <span style={{ color: colors.text.primary, fontSize: '1.3rem', flex: 1, fontWeight: 500 }}>
          <FormattedText text={response.description} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && schema && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 1.6rem 1.6rem',
                borderTop: `1px solid ${colors.border.default}`,
              }}
            >
              <div style={{ paddingTop: '1.2rem' }}>
                <JsonActionWrapper
                  data={
                    getExampleFromMediaType(response.content?.['application/json']) ||
                    generateExample(schema, spec)
                  }
                  defaultView='json'
                >
                  <SchemaViewer schema={schema} spec={spec} />
                </JsonActionWrapper>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

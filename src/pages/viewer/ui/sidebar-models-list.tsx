import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { ChevronRight } from 'lucide-react';

import { SchemaViewer, useSearchQuery, useSpec } from '@/entities/api-spec';
import { useDebounceDeferredValue } from '@/shared/hooks';
import { useColors } from '@/shared/theme';

export function SidebarModelsList() {
  const colors = useColors();
  const spec = useSpec();
  const searchQuery = useSearchQuery();
  const deferredSearchQuery = useDebounceDeferredValue(searchQuery, 350, { immediateOnEmpty: true });

  const schemas = spec?.components?.schemas;

  if (!schemas || Object.keys(schemas).length === 0) {
    return (
      <div
        style={{
          flex: 1,
          padding: '3.2rem 1.6rem',
          textAlign: 'center',
          color: colors.text.tertiary,
          fontSize: '1.3rem',
        }}
      >
        No schemas defined
      </div>
    );
  }

  const allNames = Object.keys(schemas).sort();
  const filteredNames = deferredSearchQuery
    ? allNames.filter((name) => name.toLowerCase().includes(deferredSearchQuery.toLowerCase()))
    : allNames;

  if (filteredNames.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          padding: '3.2rem 1.6rem',
          textAlign: 'center',
          color: colors.text.tertiary,
          fontSize: '1.3rem',
        }}
      >
        No matching models
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '0.4rem 0' }}>
      {filteredNames.map((name) => (
        <SchemaItem key={name} name={name} />
      ))}
    </div>
  );
}

function SchemaItem({ name }: { name: string }) {
  const colors = useColors();
  const spec = useSpec();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!spec?.components?.schemas?.[name]) return null;

  const schema = spec.components.schemas[name];

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '0.8rem 1.6rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={14} color={colors.text.tertiary} />
        </motion.div>
        <span
          style={{
            color: isExpanded ? colors.text.primary : colors.text.secondary,
            fontSize: '1.3rem',
            fontWeight: isExpanded ? 600 : 400,
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0.4rem 1.2rem 1.2rem 2.4rem',
                borderBottom: `1px solid ${colors.border.subtle}`,
              }}
            >
              <SchemaViewer schema={schema} spec={spec} depth={0} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

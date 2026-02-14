import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { useColors } from '@/shared/theme';

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div style={{ marginBottom: '2.4rem' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          width: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          padding: '0 0 0.8rem 0',
          cursor: 'pointer',
          borderBottom: `1px solid ${colors.border.subtle}`,
          marginBottom: '1.2rem',
        }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <ChevronDown size={20} color={colors.text.primary} />
        </motion.div>
        <h2
          style={{
            color: colors.text.primary,
            fontSize: '1.5rem',
            fontWeight: 600,
            margin: 0,
          }}
        >
          {title}
        </h2>
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
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion } from 'framer-motion';

import { ChevronRight } from 'lucide-react';

import { sidebarStoreActions } from '@/entities/openapi-sidebar';
import type { EndpointFlatItem } from '@/entities/openapi-spec';
import { useColors } from '@/shared/theme';

export function SidebarEndpointGroupHeader({
  endpointHeaderItem,
}: {
  endpointHeaderItem: Extract<EndpointFlatItem, { type: 'header' }>;
}) {
  const colors = useColors();

  return (
    <button
      onClick={() => sidebarStoreActions.toggleTagExpanded(endpointHeaderItem.tag)}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0 1.6rem',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: endpointHeaderItem.isExpanded ? 90 : 0 }}
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
          color: colors.text.secondary,
          fontSize: '1.2rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {endpointHeaderItem.tag}
      </span>
      <span
        style={{
          color: colors.text.secondary,
          fontSize: '1.2rem',
          marginLeft: 'auto',
          fontWeight: 500,
        }}
      >
        {endpointHeaderItem.count}
      </span>
    </button>
  );
}

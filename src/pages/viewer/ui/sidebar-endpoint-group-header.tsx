import { motion } from 'framer-motion';

import { ChevronRight } from 'lucide-react';

import { type EndpointFlatItem, useEndpoints, useSelectedEndpoint } from '@/entities/api-spec';
import { sidebarStoreActions } from '@/entities/sidebar';
import { useColors } from '@/shared/theme';

export function SidebarEndpointGroupHeader({
  endpointHeaderItem,
}: {
  endpointHeaderItem: Extract<EndpointFlatItem, { type: 'header' }>;
}) {
  const colors = useColors();
  const selectedEndpoint = useSelectedEndpoint();
  const endpoints = useEndpoints();

  const hasSelectedInGroup =
    selectedEndpoint &&
    endpoints.some(
      (e) =>
        e.path === selectedEndpoint.path &&
        e.method === selectedEndpoint.method &&
        (e.operation.tags || []).includes(endpointHeaderItem.tag),
    );

  return (
    <button
      onClick={() => {
        if (hasSelectedInGroup) return;
        sidebarStoreActions.toggleTagExpanded(endpointHeaderItem.tag);
      }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0 1.6rem',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: hasSelectedInGroup ? 'default' : 'pointer',
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
          color: colors.text.tertiary,
          fontSize: '1rem',
          fontWeight: 600,
          backgroundColor: colors.bg.overlay,
          padding: '0.2rem 0.6rem',
          borderRadius: '1rem',
          lineHeight: 1,
          minWidth: '2rem',
          textAlign: 'center',
          border: `1px solid ${colors.border.default}`,
        }}
      >
        {endpointHeaderItem.count}
      </span>
    </button>
  );
}

import { motion } from 'framer-motion';

import { ChevronRight, ExternalLink, Info } from 'lucide-react';

import {
  type EndpointFlatItem,
  useEndpoints,
  useSelectedEndpoint,
  useSpec,
} from '@/entities/api-spec';
import { sidebarStoreActions } from '@/entities/sidebar';
import { useColors } from '@/shared/theme';
import { Tooltip } from '@/shared/ui/tooltip';

export function SidebarEndpointGroupHeader({
  endpointHeaderItem,
}: {
  endpointHeaderItem: Extract<EndpointFlatItem, { type: 'header' }>;
}) {
  const colors = useColors();
  const spec = useSpec();
  const selectedEndpoint = useSelectedEndpoint();
  const endpoints = useEndpoints();

  const tagInfo = spec?.tags?.find((t) => t.name === endpointHeaderItem.tag);

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
      {tagInfo?.description && (
        <Tooltip
          content={
            <span
              style={{ fontSize: '1.1rem', lineHeight: 1.5, maxWidth: '24rem', display: 'block' }}
            >
              {tagInfo.description}
            </span>
          }
          placement='right'
          delay={200}
        >
          <span
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: colors.text.tertiary,
              cursor: 'default',
            }}
          >
            <Info size={12} />
          </span>
        </Tooltip>
      )}
      {tagInfo?.externalDocs && (
        <a
          href={tagInfo.externalDocs.url}
          target='_blank'
          rel='noopener noreferrer'
          title={tagInfo.externalDocs.description || 'External Documentation'}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: 'auto',
            color: colors.text.tertiary,
          }}
        >
          <ExternalLink size={12} />
        </a>
      )}
    </button>
  );
}

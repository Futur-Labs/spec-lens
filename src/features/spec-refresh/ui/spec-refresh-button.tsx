import { motion } from 'framer-motion';

import { RefreshCw } from 'lucide-react';

import { useRefreshSpec } from '../model/use-refresh-spec';
import { useIsSpecRefreshing } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { Tooltip } from '@/shared/ui/tooltip';

export function SpecRefreshButton() {
  const colors = useColors();

  const { handleRefreshSpec } = useRefreshSpec();
  const isRefreshing = useIsSpecRefreshing();

  return (
    <Tooltip content={'Refresh spec from URL'} placement='bottom-start' delay={300}>
      <motion.button
        layout
        onClick={handleRefreshSpec}
        disabled={isRefreshing}
        whileHover={
          isRefreshing
            ? {}
            : {
                backgroundColor: colors.bg.overlayHover,
                borderColor: 'rgba(255,255,255,0.2)',
              }
        }
        whileTap={isRefreshing ? {} : { scale: 0.98 }}
        transition={{
          layout: { duration: 0.2, ease: 'easeOut' },
          default: { duration: 0.15 },
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '0.8rem 1rem',
          backgroundColor: colors.bg.overlay,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '0.6rem',
          color: isRefreshing ? colors.text.tertiary : colors.text.primary,
          fontSize: '1.3rem',
          cursor: isRefreshing ? 'not-allowed' : 'pointer',
          fontWeight: 500,
          overflow: 'hidden',
        }}
      >
        <motion.div
          layout='position'
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{
            rotate: {
              duration: isRefreshing ? 1 : 0,
              repeat: isRefreshing ? Infinity : 0,
              ease: 'linear',
            },
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={14} />
        </motion.div>
      </motion.button>
    </Tooltip>
  );
}

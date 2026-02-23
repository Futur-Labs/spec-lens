import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';

import { FolderOpen } from 'lucide-react';

import { specStoreActions } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { Tooltip } from '@/shared/ui/tooltip';

export function SpecClearButton() {
  const navigate = useNavigate();

  const colors = useColors();

  const handleClearSpec = async () => {
    await navigate({ to: '/', replace: true });
    specStoreActions.clearSpec();
  };

  return (
    <Tooltip content={'Open spec'} placement='bottom-start' delay={300}>
      <motion.button
        onClick={handleClearSpec}
        whileHover={{
          backgroundColor: colors.bg.overlayHover,
          border: `1px solid ${colors.border.hover}`,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '0.8rem 1rem',
          backgroundColor: colors.bg.overlay,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '0.6rem',
          color: colors.text.primary,
          fontSize: '1.3rem',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        <FolderOpen size={14} />
      </motion.button>
    </Tooltip>
  );
}

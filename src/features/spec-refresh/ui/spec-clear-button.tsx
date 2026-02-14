import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';

import { Upload } from 'lucide-react';

import { specStoreActions } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

export function SpecClearButton() {
  const navigate = useNavigate();

  const colors = useColors();

  const handleClearSpec = () => {
    specStoreActions.clearSpec();
    navigate({ to: '/', replace: true });
  };

  return (
    <motion.button
      onClick={handleClearSpec}
      whileHover={{
        backgroundColor: colors.bg.overlayHover,
        borderColor: 'rgba(255,255,255,0.2)',
        scale: 1.02,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.8rem 1.4rem',
        backgroundColor: colors.bg.overlay,
        border: `1px solid ${colors.border.default}`,
        borderRadius: '0.6rem',
        color: colors.text.primary,
        fontSize: '1.3rem',
        cursor: 'pointer',
        fontWeight: 500,
      }}
    >
      <Upload size={14} />
      <span>Change Spec</span>
    </motion.button>
  );
}

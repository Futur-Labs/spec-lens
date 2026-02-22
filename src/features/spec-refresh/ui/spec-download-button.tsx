import { motion } from 'framer-motion';

import { Download } from 'lucide-react';

import { useSpecStore } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { Tooltip } from '@/shared/ui/tooltip';

export function SpecDownloadButton() {
  const colors = useColors();
  const spec = useSpecStore((s) => s.spec);

  const handleDownloadSpec = () => {
    if (!spec) return;
    const json = JSON.stringify(spec, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const title = spec.info?.title?.replace(/[^a-zA-Z0-9가-힣\s-_]/g, '') || 'openapi-spec';
    a.download = `${title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Tooltip content={'Download spec'} placement='bottom-start' delay={300}>
      <motion.button
        onClick={handleDownloadSpec}
        disabled={!spec}
        whileHover={
          !spec
            ? {}
            : {
                backgroundColor: colors.bg.overlayHover,
                border: `1px solid ${colors.border.hover}`,
              }
        }
        whileTap={!spec ? {} : { scale: 0.98 }}
        transition={{ duration: 0.15 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '0.8rem 1rem',
          backgroundColor: colors.bg.overlay,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '0.6rem',
          color: !spec ? colors.text.tertiary : colors.text.primary,
          fontSize: '1.3rem',
          cursor: !spec ? 'not-allowed' : 'pointer',
          fontWeight: 500,
        }}
      >
        <Download size={14} />
      </motion.button>
    </Tooltip>
  );
}

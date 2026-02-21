import { motion } from 'framer-motion';

import { FileJson, Link, Menu, X } from 'lucide-react';

import { ViewerToolbarActions } from './viewer-toolbar-actions';
import { useSpec, useSpecStore } from '@/entities/api-spec';
import { sidebarStoreActions, useIsSidebarOpen } from '@/entities/sidebar';
import { useColors } from '@/shared/theme';

export function ViewerToolbar() {
  const colors = useColors();
  const spec = useSpec();
  const specSource = useSpecStore((s) => s.specSource);
  const isSidebarOpen = useIsSidebarOpen();

  if (!spec) return null;

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.2rem 2.4rem',
        backgroundColor: colors.bg.elevated,
        borderBottom: `1px solid ${colors.border.default}`,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <motion.button
          onClick={sidebarStoreActions.toggleSidebar}
          whileHover={{
            backgroundColor: colors.bg.overlayHover,
            border: `1px solid ${colors.border.hover}`,
            scale: 1.02,
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.8rem',
            backgroundColor: colors.bg.overlay,
            border: `1px solid ${colors.border.default}`,
            borderRadius: '0.6rem',
            cursor: 'pointer',
          }}
        >
          {isSidebarOpen ? (
            <X size={18} color={colors.text.secondary} />
          ) : (
            <Menu size={18} color={colors.text.secondary} />
          )}
        </motion.button>
        <div>
          <h1
            style={{
              color: colors.text.primary,
              fontSize: '1.6rem',
              fontWeight: 600,
              margin: 0,
            }}
          >
            {spec.info.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ color: colors.text.tertiary, fontSize: '1.2rem' }}>
              v{spec.info.version}
            </span>
            {specSource && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.2rem 0.6rem',
                  backgroundColor:
                    specSource.type === 'url'
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(139, 92, 246, 0.15)',
                  borderRadius: '0.4rem',
                  fontSize: '1.1rem',
                  color: specSource.type === 'url' ? '#60a5fa' : '#a78bfa',
                }}
              >
                {specSource.type === 'url' ? <Link size={10} /> : <FileJson size={10} />}
                {specSource.type === 'url' ? 'URL' : 'File'}
              </span>
            )}
          </div>
        </div>
      </div>

      <ViewerToolbarActions />
    </header>
  );
}

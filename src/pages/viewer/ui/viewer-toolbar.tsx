import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { FileJson, Link, Menu, RefreshCw, Upload, X } from 'lucide-react';

import { sidebarStoreActions, useIsSidebarOpen } from '@/entities/openapi-sidebar';
import {
  specStoreActions,
  useSpec,
  useSpecStore,
  validateOpenAPISpec,
  type OpenAPISpec,
} from '@/entities/openapi-spec';
import { checkSpecUpdate } from '@/shared/server';
import { useColors } from '@/shared/theme';

export function ViewerToolbar() {
  const navigate = useNavigate();

  const colors = useColors();
  const spec = useSpec();
  const specSource = useSpecStore((s) => s.specSource);
  const isSidebarOpen = useIsSidebarOpen();

  // Local state for spinning animation
  const [isSpinning, setIsSpinning] = useState(false);

  const handleClearSpec = () => {
    specStoreActions.clearSpec();
    navigate({ to: '/', replace: true });
  };

  // Refresh spec from URL (only for URL sources)
  const handleRefreshSpec = async () => {
    if (!specSource || specSource.type !== 'url') return;
    if (isSpinning) return; // Prevent double-click

    // Start loading state
    setIsSpinning(true);
    specStoreActions.setRefreshing(true);
    specStoreActions.setRefreshError(null);

    const MIN_SPIN_DURATION = 800; // Minimum spin time for UX
    const startTime = Date.now();

    try {
      const result = await checkSpecUpdate({
        data: {
          url: specSource.name,
          etag: specSource.etag || undefined,
          lastModified: specSource.lastModified || undefined,
        },
      });

      if (result.hasUpdate && result.data) {
        // Validate the new spec
        const validation = validateOpenAPISpec(result.data);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Update the spec with new data
        specStoreActions.setSpec(result.data as OpenAPISpec, {
          type: 'url',
          name: specSource.name,
          etag: result.newEtag,
          lastModified: result.newLastModified,
        });
      } else {
        // No update available - just update the refresh time
        specStoreActions.updateSpecSource({
          etag: result.newEtag || specSource.etag,
          lastModified: result.newLastModified || specSource.lastModified,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh spec';
      specStoreActions.setRefreshError(message);
    } finally {
      // Ensure minimum spin duration for smooth UX
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_SPIN_DURATION - elapsed);

      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      setIsSpinning(false);
      specStoreActions.setRefreshing(false);
    }
  };

  // Check if refresh is available (only for URL sources)
  const canRefresh = specSource?.type === 'url';

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
            borderColor: 'rgba(255,255,255,0.2)',
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        {canRefresh && (
          <motion.button
            layout
            onClick={handleRefreshSpec}
            disabled={isSpinning}
            whileHover={
              isSpinning
                ? {}
                : {
                    backgroundColor: colors.bg.overlayHover,
                    borderColor: 'rgba(255,255,255,0.2)',
                    scale: 1.02,
                  }
            }
            whileTap={isSpinning ? {} : { scale: 0.98 }}
            transition={{
              layout: { duration: 0.2, ease: 'easeOut' },
              default: { duration: 0.15 },
            }}
            title={isSpinning ? 'Refreshing...' : 'Refresh spec from URL'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '0.8rem 1.4rem',
              backgroundColor: colors.bg.overlay,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '0.6rem',
              color: isSpinning ? colors.text.tertiary : colors.text.primary,
              fontSize: '1.3rem',
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              overflow: 'hidden',
            }}
          >
            <motion.div
              layout='position'
              animate={{ rotate: isSpinning ? 360 : 0 }}
              transition={{
                rotate: {
                  duration: isSpinning ? 1 : 0,
                  repeat: isSpinning ? Infinity : 0,
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
            <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
              {isSpinning ? 'Refreshing' : 'Refresh'}
            </span>
          </motion.button>
        )}
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
      </div>
    </header>
  );
}

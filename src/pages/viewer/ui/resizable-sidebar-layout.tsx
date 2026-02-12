import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type PropsWithChildren } from 'react';

import { useResizeSidebar } from '../model/use-resize-sidebar';
import { useIsSidebarOpen } from '@/entities/openapi-sidebar';
import { useColors } from '@/shared/theme';

let hasInitiallyMounted = false;

export function ResizableSidebarLayout({ children }: PropsWithChildren) {
  const colors = useColors();
  const isSidebarOpen = useIsSidebarOpen();

  const { sidebarWidth, isResizing, startResizing, expandToFitContent } = useResizeSidebar();

  useEffect(() => {
    hasInitiallyMounted = true;
  }, []);

  return (
    <AnimatePresence mode='wait'>
      {isSidebarOpen && (
        <motion.aside
          initial={hasInitiallyMounted ? { width: 0, opacity: 0 } : false}
          animate={{ width: sidebarWidth.get() || 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{
            width: { duration: isResizing ? 0 : 0.2, ease: 'easeInOut' },
            opacity: { duration: 0.2 },
          }}
          style={{
            width: sidebarWidth, // Bind MotionValue directly
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: colors.bg.subtle,
            borderRight: `1px solid ${colors.border.subtle}`,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            position: 'relative',
          }}
        >
          {children}

          <div
            onMouseDown={startResizing}
            onDoubleClick={expandToFitContent}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '0.4rem',
              cursor: 'col-resize',
              backgroundColor: isResizing ? colors.feedback.success : 'transparent',
              transition: 'background-color 0.2s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              if (!isResizing) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0)';
            }}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

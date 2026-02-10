import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type PropsWithChildren } from 'react';

import { useResizeSidebar } from '../model/use-resize-sidebar';
import { useIsSidebarOpen } from '@/entities/openapi-sidebar';

let hasInitiallyMounted = false;

export function ResizableSidebarLayout({ children }: PropsWithChildren) {
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
            backgroundColor: '#161616',
            borderRight: '1px solid rgba(255,255,255,0.08)',
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
              backgroundColor: isResizing ? '#10b981' : 'transparent',
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

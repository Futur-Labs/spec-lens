import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  type Placement,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, type CSSProperties, type ReactNode } from 'react';

import { useIsDarkMode } from '@/shared/theme';

export function Tooltip({
  contentStyle,
  children,
  content,
  placement = 'top',
  delay = 500,
  fullWidth = false,
  disabled = false,
}: {
  contentStyle?: CSSProperties;
  children: ReactNode;
  content: ReactNode;
  placement?: Placement;
  delay?: number;
  fullWidth?: boolean;
  disabled?: boolean;
}) {
  const isDark = useIsDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [floatingElement, setFloatingElement] = useState<HTMLElement | null>(null);

  const { floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    elements: {
      reference: referenceElement,
      floating: floatingElement,
    },
    middleware: [
      offset(8),
      flip({
        fallbackAxisSideDirection: 'start',
      }),
      shift(),
    ],
  });

  const hover = useHover(context, { move: false, delay: { open: delay, close: 0 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <>
      <div
        ref={setReferenceElement}
        {...getReferenceProps()}
        style={{
          display: fullWidth ? 'block' : 'inline-block',
          width: fullWidth ? '100%' : 'auto',
        }}
      >
        {children}
      </div>
      <FloatingPortal>
        <AnimatePresence>
          {isOpen && !disabled && (
            <div
              ref={setFloatingElement}
              style={{ ...floatingStyles, zIndex: 9999 }}
              {...getFloatingProps()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
              >
                <div
                  style={{
                    backgroundColor: isDark ? '#ffffff' : '#1a1a1a',
                    color: isDark ? '#111111' : '#f3f4f6',
                    padding: '0.6rem 1rem',
                    borderRadius: '0.4rem',
                    fontSize: '1.4rem',
                    fontWeight: 600,
                    boxShadow: isDark
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)',
                    border: isDark
                      ? '1px solid rgba(0,0,0,0.08)'
                      : '1px solid rgba(255,255,255,0.1)',
                    whiteSpace: 'nowrap',
                    ...contentStyle,
                  }}
                >
                  {content}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  );
}

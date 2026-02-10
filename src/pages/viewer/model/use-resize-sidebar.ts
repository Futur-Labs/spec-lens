import { useMotionValue } from 'framer-motion';
import { useEffect, useEffectEvent, useState } from 'react';

const SIDEBAR_WIDTH = 320;
const SIDEBAR_MIN_WIDTH = 240;
const SIDEBAR_MAX_WIDTH = 800;

export function useResizeSidebar() {
  const sidebarWidth = useMotionValue(SIDEBAR_WIDTH);

  const [isResizing, setIsResizing] = useState(false);

  const startResizing = () => {
    setIsResizing(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  const resize = (mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= SIDEBAR_MIN_WIDTH && newWidth <= SIDEBAR_MAX_WIDTH) {
        sidebarWidth.set(newWidth);
      }
    }
  };

  const stopResizingEvent = useEffectEvent(stopResizing);
  const resizeEvent = useEffectEvent(resize);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resizeEvent);
      window.addEventListener('mouseup', stopResizingEvent);
    }

    return () => {
      window.removeEventListener('mousemove', resizeEvent);
      window.removeEventListener('mouseup', stopResizingEvent);
    };
  }, [isResizing]);

  return {
    sidebarWidth,
    isResizing,
    startResizing,
  };
}

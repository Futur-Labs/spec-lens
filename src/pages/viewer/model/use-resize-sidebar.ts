import { useMotionValue } from 'framer-motion';
import { useEffect, useEffectEvent, useState } from 'react';

export function UseResizeSidebar() {
  const sidebarWidth = useMotionValue(320);

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
      if (newWidth >= 240 && newWidth <= 800) {
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

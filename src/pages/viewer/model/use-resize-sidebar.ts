import { useMotionValue } from 'framer-motion';
import { useEffect, useEffectEvent, useState } from 'react';

import { useSpecStore } from '@/entities/openapi-spec';

const SIDEBAR_WIDTH = 320;
const SIDEBAR_MIN_WIDTH = 240;
const SIDEBAR_MAX_WIDTH = 850;
const SIDEBAR_PADDING = 130; // indent(32) + badge(50) + gap(10) + padding(32) + buffer(6)

function measureTextWidth(text: string, font: string): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;
  context.font = font;
  return context.measureText(text).width;
}

export function useResizeSidebar() {
  const sidebarWidth = useMotionValue(SIDEBAR_WIDTH);
  const endpoints = useSpecStore((s) => s.endpoints);

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

  const expandToFitContent = () => {
    if (endpoints.length === 0) return;

    // Find longest path
    const longestPath = endpoints.reduce(
      (longest, ep) => (ep.path.length > longest.length ? ep.path : longest),
      '',
    );

    // Measure text width (monospace 1.3rem = ~13px)
    const textWidth = measureTextWidth(longestPath, '13px monospace');
    const targetWidth = Math.min(
      Math.max(textWidth + SIDEBAR_PADDING, SIDEBAR_MIN_WIDTH),
      SIDEBAR_MAX_WIDTH,
    );

    sidebarWidth.set(targetWidth);
  };

  return {
    sidebarWidth,
    isResizing,
    startResizing,
    expandToFitContent,
  };
}

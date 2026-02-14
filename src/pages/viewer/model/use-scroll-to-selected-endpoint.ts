import { useEffect, useEffectEvent, type RefObject } from 'react';

import { useSelectedEndpoint } from '@/entities/api-spec';
import { smoothScrollTo } from '@/shared/lib';

export function useScrollToSelectedEndpoint(
  endpointRefs: RefObject<Map<string, HTMLButtonElement> | null>,
) {
  const selectedEndpoint = useSelectedEndpoint();

  const scrollToSelectedElement = useEffectEvent(() => {
    if (!selectedEndpoint) return;

    const key = `${selectedEndpoint.method}-${selectedEndpoint.path}`;
    const element = endpointRefs.current?.get(key);

    if (!element) return;

    // Small delay to ensure DOM is updated after tag expansion
    const timeoutId = setTimeout(() => {
      // Find the scroll container
      let container: HTMLElement | null = element.parentElement;
      while (container) {
        const style = window.getComputedStyle(container);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          break;
        }
        container = container.parentElement;
      }

      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Check if element is outside visible area (with some margin)
      const margin = 100;
      const isAboveView = elementRect.top < containerRect.top + margin;
      const isBelowView = elementRect.bottom > containerRect.bottom - margin;

      if (isAboveView || isBelowView) {
        const containerHeight = container.clientHeight;
        const offset = containerHeight / 2 - element.offsetHeight / 2;
        smoothScrollTo(element, offset);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  });

  useEffect(() => {
    scrollToSelectedElement();
  }, [selectedEndpoint]);
}

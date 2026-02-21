import type { VirtualizerOptions } from '@tanstack/react-virtual';
import type { RefObject } from 'react';

function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
}

/**
 * TanStack Virtual 용 smooth scroll 함수를 생성합니다.
 * useVirtualizer의 scrollToFn 옵션에 전달하여 사용합니다.
 *
 * @example
 * const scrollToFn = useVirtualSmoothScroll(parentRef);
 * const virtualizer = useVirtualizer({ scrollToFn, ... });
 * virtualizer.scrollToIndex(index, { align: 'center', behavior: 'smooth' });
 */
export function useVirtualSmoothScroll<TScrollElement extends Element>(
  scrollElementRef: RefObject<TScrollElement | null>,
  duration = 300,
): VirtualizerOptions<TScrollElement, Element>['scrollToFn'] {
  const scrollingRef = { current: 0 };

  return (offset, options, instance) => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    const horizontal = instance.options.horizontal;
    const toOffset = offset + (options.adjustments ?? 0);
    const prop = horizontal ? 'left' : 'top';

    if (options.behavior === 'smooth') {
      const start = horizontal
        ? (scrollElement as unknown as HTMLElement).scrollLeft
        : (scrollElement as unknown as HTMLElement).scrollTop;
      const startTime = (scrollingRef.current = Date.now());

      const run = () => {
        if (scrollingRef.current !== startTime) return;

        const now = Date.now();
        const elapsed = now - startTime;
        const progress = easeInOutQuint(Math.min(elapsed / duration, 1));
        const interpolated = start + (toOffset - start) * progress;

        scrollElement.scrollTo({ [prop]: interpolated });

        if (elapsed < duration) {
          requestAnimationFrame(run);
        }
      };

      requestAnimationFrame(run);
    } else {
      scrollElement.scrollTo({ [prop]: toOffset, behavior: options.behavior });
    }
  };
}

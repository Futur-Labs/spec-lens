import { useSyncExternalStore, type RefObject } from 'react';

export function useElementSize(ref: RefObject<HTMLElement | null>): {
  width: number;
  height: number;
} {
  const subscribe = (callback: () => void) => {
    const element = ref.current;
    if (!element) {
      return () => {};
    }

    const observer = new ResizeObserver(callback);
    observer.observe(element);

    return () => observer.disconnect();
  };

  // useSyncExternalStore는 참조 동일성으로 변경을 감지하므로
  // 문자열 비교로 실제 값 변경 시에만 리렌더링
  const sizeString = useSyncExternalStore(
    subscribe,
    () => {
      const el = ref.current;
      if (!el) return '0,0';
      const { width, height } = el.getBoundingClientRect();
      return `${width},${height}`;
    },
    () => '0,0',
  );

  const [w, h] = sizeString.split(',');
  return { width: Number(w), height: Number(h) };
}

import { type Virtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';

import { useSelectedEndpoint, type EndpointFlatItem } from '@/entities/api-spec';

/**
 * 새로고침 시 hash 에서 복원된 엔드포인트로 최초 1회만 스크롤합니다.
 */
export function useInitialScrollToEndpoint(
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  flatItems: EndpointFlatItem[],
) {
  const selectedEndpoint = useSelectedEndpoint();
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (hasScrolled.current || !selectedEndpoint || flatItems.length === 0) return;

    const index = flatItems.findIndex(
      (item) =>
        item.type === 'endpoint' &&
        item.endpoint.method === selectedEndpoint.method &&
        item.endpoint.path === selectedEndpoint.path,
    );

    if (index >= 0) {
      hasScrolled.current = true;

      setTimeout(() => {
        virtualizer.scrollToIndex(index, { align: 'center' });
      }, 150);
    }
  }, [selectedEndpoint, flatItems, virtualizer]);
}

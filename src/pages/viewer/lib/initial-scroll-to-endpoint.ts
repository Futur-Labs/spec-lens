import { generateEndpointHash } from './generate-endpoint-hash';
import { type EndpointFlatItem } from '@/entities/api-spec';

const TAG_HEADER_HEIGHT = 40;
const ENDPOINT_ITEM_HEIGHT = 36;

/**
 * URL hash 기반으로 복원할 엔드포인트의 초기 스크롤 오프셋을 계산합니다.
 * useVirtualizer의 initialOffset 옵션에 전달하여 첫 렌더링부터 올바른 위치에 표시합니다.
 */
export function calcInitialEndpointOffset(
  flatItems: EndpointFlatItem[],
  containerHeight: number,
): number {
  if (typeof window === 'undefined') return 0;

  const hash = window.location.hash.slice(1);
  if (!hash || flatItems.length === 0) return 0;

  const index = flatItems.findIndex(
    (item) =>
      item.type === 'endpoint' &&
      generateEndpointHash(item.endpoint.method, item.endpoint.path) === hash,
  );

  if (index < 0) return 0;

  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += flatItems[i].type === 'header' ? TAG_HEADER_HEIGHT : ENDPOINT_ITEM_HEIGHT;
  }

  // Center the item within the container
  return Math.max(0, offset - containerHeight / 2 + ENDPOINT_ITEM_HEIGHT / 2);
}

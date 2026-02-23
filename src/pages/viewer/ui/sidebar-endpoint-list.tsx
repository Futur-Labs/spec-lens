import { VirtualizedEndpointList } from './virtualized-endpoint-list.tsx';
import { generateEndpointHash } from '../lib/generate-endpoint-hash.ts';
import { useFlatEndpointItems } from '../model/use-flat-endpoint-items.ts';
import { useRestoreEndpointFromHash } from '../model/use-restore-endpoint-from-hash.ts';
import {
  useSearchQuery,
  useSelectedMethods,
  useSelectedTags,
  useSpecStore,
} from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

export function SidebarEndpointList() {
  const colors = useColors();
  const { flatItems } = useFlatEndpointItems();
  const endpoints = useSpecStore((s) => s.endpoints);
  const searchQuery = useSearchQuery();
  const selectedMethods = useSelectedMethods();
  const selectedTags = useSelectedTags();

  useRestoreEndpointFromHash();

  const hasActiveFilters = searchQuery || selectedMethods.length > 0 || selectedTags.length > 0;

  // hash 검증용 Set — React Compiler가 자동 메모이제이션
  const endpointHashSet = new Set(endpoints.map((ep) => generateEndpointHash(ep.method, ep.path)));
  const flatItemHashSet = new Set(
    flatItems
      .filter((item) => item.type === 'endpoint')
      .map((item) => generateEndpointHash(item.endpoint.method, item.endpoint.path)),
  );

  if (flatItems.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          padding: '3.2rem 1.6rem',
          textAlign: 'center',
          color: colors.text.tertiary,
          fontSize: '1.3rem',
        }}
      >
        No endpoints found
      </div>
    );
  }

  if (!hasActiveFilters) {
    const hash = window.location.hash.slice(1);
    if (hash && endpointHashSet.has(hash) && !flatItemHashSet.has(hash)) {
      return <div style={{ flex: 1 }} />;
    }
  }

  return <VirtualizedEndpointList flatItems={flatItems} />;
}

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
    if (hash) {
      const hashMatchesEndpoint = endpoints.some(
        (ep) => generateEndpointHash(ep.method, ep.path) === hash,
      );
      const hashTargetInList = flatItems.some(
        (item) =>
          item.type === 'endpoint' &&
          generateEndpointHash(item.endpoint.method, item.endpoint.path) === hash,
      );
      if (hashMatchesEndpoint && !hashTargetInList) {
        return <div style={{ flex: 1 }} />;
      }
    }
  }

  return <VirtualizedEndpointList flatItems={flatItems} />;
}

import {
  type ApiSpec,
  type SpecSource,
  getAllTags,
  specStoreActions,
  specHistoryActions,
  endpointSelectionStoreActions,
} from '@/entities/api-spec';
import { sidebarStoreActions } from '@/entities/sidebar';

export function setSpecWithExpanded(
  spec: ApiSpec,
  source: SpecSource,
  { skipHistory = false }: { skipHistory?: boolean } = {},
) {
  specStoreActions.setSpec(spec, source);
  if (!skipHistory) {
    specHistoryActions.addEntry(spec, source);
  }
  const tags = getAllTags(spec);
  sidebarStoreActions.expandAllTags(tags);
  sidebarStoreActions.setSidebarOpen(true);
  endpointSelectionStoreActions.clearSelection();
}

import {
  type OpenAPISpec,
  type SpecSource,
  getAllTags,
  specStoreActions,
  endpointSelectionStoreActions,
} from '@/entities/api-spec';
import { sidebarStoreActions } from '@/entities/sidebar';

export function setSpecWithExpanded(spec: OpenAPISpec, source: SpecSource) {
  specStoreActions.setSpec(spec, source);
  const tags = getAllTags(spec);
  sidebarStoreActions.expandAllTags(tags);
  sidebarStoreActions.setSidebarOpen(true);
  endpointSelectionStoreActions.clearSelection();
}

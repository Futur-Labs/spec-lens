import { sidebarStoreActions } from '@/entities/openapi-sidebar';
import {
  type OpenAPISpec,
  type SpecSource,
  getAllTags,
  specStoreActions,
} from '@/entities/openapi-spec';

export function setSpecWithExpanded(spec: OpenAPISpec, source: SpecSource) {
  specStoreActions.setSpec(spec, source);
  const tags = getAllTags(spec);
  sidebarStoreActions.expandAllTags(tags);
}

import { sidebarStoreActions } from '@/entities/openapi-sidebar';
import { type OpenAPISpec, type SpecSource, specStoreActions } from '@/entities/openapi-spec';

export function setSpecWithExpanded(spec: OpenAPISpec, source: SpecSource) {
  specStoreActions.setSpec(spec, source);
  sidebarStoreActions.expandAllTags();
}

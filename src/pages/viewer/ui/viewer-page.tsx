import { Navigate } from '@tanstack/react-router';

import { ViewerLayout } from './viewer-layout.tsx';
import { useSpec, useSpecStore, useSpecStoreHydration } from '@/entities/api-spec/index.ts';
import { sidebarStoreActions } from '@/entities/sidebar/index.ts';

export function ViewerPage() {
  const hydrated = useSpecStoreHydration(() => {
    const tags = useSpecStore.getState().tags;
    sidebarStoreActions.expandAllTags(tags);
  });
  const spec = useSpec();

  if (hydrated && !spec) {
    return <Navigate to='/' replace />;
  }

  if (!hydrated) {
    return null;
  }

  if (!spec) {
    return null;
  }

  return <ViewerLayout />;
}

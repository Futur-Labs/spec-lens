import { Navigate } from '@tanstack/react-router';

import { ViewerLayout } from './viewer-layout.tsx';
import { useSpec, useSpecStore, useSpecStoreHydration } from '@/entities/api-spec/index.ts';
import { sidebarStoreActions } from '@/entities/sidebar/index.ts';
import { useColors } from '@/shared/theme';

export function ViewerPage() {
  const colors = useColors();
  const hydrated = useSpecStoreHydration(() => {
    const tags = useSpecStore.getState().tags;
    sidebarStoreActions.expandAllTags(tags);
  });
  const spec = useSpec();

  if (hydrated && !spec) {
    return <Navigate to='/' replace />;
  }

  if (!hydrated || !spec) {
    return <div style={{ height: '100%', width: '100%', backgroundColor: colors.bg.base }} />;
  }

  return <ViewerLayout />;
}

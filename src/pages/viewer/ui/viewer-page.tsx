import { Navigate } from '@tanstack/react-router';

import { ViewerLayout } from './viewer-layout.tsx';
import { useSpec, useSpecStoreHydration } from '@/entities/openapi-spec';

export function ViewerPage() {
  const hydrated = useSpecStoreHydration();
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

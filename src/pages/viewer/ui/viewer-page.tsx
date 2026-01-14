import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useSpec, useSpecStoreHydration } from '@/entities/openapi-spec';
import { ViewerLayout } from '@/widgets/openapi-viewer';

export function ViewerPage() {
  const navigate = useNavigate();
  const hydrated = useSpecStoreHydration();
  const spec = useSpec();

  // Redirect to / when no spec is loaded
  useEffect(() => {
    if (hydrated && !spec) {
      navigate({ to: '/', replace: true });
    }
  }, [hydrated, spec, navigate]);

  // Wait for hydration to complete before rendering
  if (!hydrated) {
    return null;
  }

  // If no spec, show nothing while redirecting
  if (!spec) {
    return null;
  }

  return <ViewerLayout />;
}

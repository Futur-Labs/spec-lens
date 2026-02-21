import { createFileRoute, Outlet } from '@tanstack/react-router';

import { ViewerPage } from '@/pages/viewer';

export const Route = createFileRoute('/api-docs')({
  component: ApiDocsLayout,
});

function ApiDocsLayout() {
  return (
    <>
      <ViewerPage />
      <Outlet />
    </>
  );
}

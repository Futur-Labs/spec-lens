import { FlexColumn } from '@jigoooo/shared-ui';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <FlexColumn style={{ height: '100%' }}>Hello &quot;/&quot;!</FlexColumn>;
}

import { ResizableSidebarLayout } from './resizable-sidebar-layout';
import { SidebarEndpointList } from './sidebar-endpoint-list';
import { SidebarHeader } from './sidebar-header';

export function Sidebar() {
  return (
    <ResizableSidebarLayout>
      <SidebarHeader />

      <SidebarEndpointList />
    </ResizableSidebarLayout>
  );
}

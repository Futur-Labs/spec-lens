export type SidebarState = {
  isSidebarOpen: boolean;
  expandedTags: string[];
};

export type SidebarActions = {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTagExpanded: (tag: string) => void;
  expandAllTags: () => void;
  collapseAllTags: () => void;
};

export type SidebarStore = SidebarState & { actions: SidebarActions };

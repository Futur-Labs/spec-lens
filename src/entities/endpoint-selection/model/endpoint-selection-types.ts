import type { HttpMethod } from '@/shared/type';

export type SelectedEndpoint = {
  path: string;
  method: HttpMethod;
};

export type EndpointSelectionState = {
  selectedEndpoint: SelectedEndpoint | null;
};

export type EndpointSelectionActions = {
  selectEndpoint: (path: string, method: HttpMethod) => void;
  clearSelection: () => void;
};

export type EndpointSelectionStore = EndpointSelectionState & { actions: EndpointSelectionActions };

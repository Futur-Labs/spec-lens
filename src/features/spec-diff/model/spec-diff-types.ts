import type { HttpMethod } from '@/shared/type';

export type EndpointKey = `${HttpMethod}:${string}`;

export type EndpointChange = {
  method: HttpMethod;
  path: string;
  summary?: string;
};

export type EndpointModification = EndpointChange & {
  changes: string[];
};

export type DiffResult = {
  added: EndpointChange[];
  removed: EndpointChange[];
  modified: EndpointModification[];
  summary: {
    totalAdded: number;
    totalRemoved: number;
    totalModified: number;
    oldEndpointCount: number;
    newEndpointCount: number;
  };
};

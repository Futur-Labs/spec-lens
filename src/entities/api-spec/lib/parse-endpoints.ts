import type { ApiSpec, ParsedEndpoint, EndpointsByTag } from '../model/api-types.ts';
import { HTTP_METHODS } from '@/shared/type';

/**
 * Parse OpenAPI spec and extract all endpoints
 */
export function parseEndpoints(spec: ApiSpec): ParsedEndpoint[] {
  const endpoints: ParsedEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    if (!pathItem) continue;

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (operation) {
        endpoints.push({
          path,
          method,
          operation,
          pathItem,
        });
      }
    }
  }

  return endpoints;
}

/**
 * Group endpoints by their first tag
 */
export function groupEndpointsByTag(endpoints: ParsedEndpoint[]): EndpointsByTag {
  const grouped: EndpointsByTag = {};
  const untagged: ParsedEndpoint[] = [];

  for (const endpoint of endpoints) {
    const tags = endpoint.operation.tags;
    if (tags && tags.length > 0) {
      const primaryTag = tags[0];
      if (!grouped[primaryTag]) {
        grouped[primaryTag] = [];
      }
      grouped[primaryTag].push(endpoint);
    } else {
      untagged.push(endpoint);
    }
  }

  if (untagged.length > 0) {
    grouped['untagged'] = untagged;
  }

  return grouped;
}

/**
 * Get all unique tags from spec
 */
export function getAllTags(spec: ApiSpec): string[] {
  const tagSet = new Set<string>();

  // From spec.tags
  if (spec.tags) {
    for (const tag of spec.tags) {
      tagSet.add(tag.name);
    }
  }

  // From operations
  for (const pathItem of Object.values(spec.paths)) {
    if (!pathItem) continue;
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (operation?.tags) {
        for (const tag of operation.tags) {
          tagSet.add(tag);
        }
      }
    }
  }

  return Array.from(tagSet).sort();
}

import type { ParsedEndpoint } from '@/entities/api-spec';
import { createKoreanSearchRegex } from '@/shared/lib';
import type { HttpMethod } from '@/shared/type';

export function filterEndpoints(
  endpoints: ParsedEndpoint[],
  options: {
    searchQuery?: string;
    selectedTags?: string[];
    selectedMethods?: HttpMethod[];
  },
): ParsedEndpoint[] {
  const { searchQuery, selectedTags, selectedMethods } = options;

  const hasMethodFilter = selectedMethods != null && selectedMethods.length > 0;
  const hasTagFilter = selectedTags != null && selectedTags.length > 0;
  const trimmedQuery = searchQuery?.trim() ?? '';
  const searchRegex = trimmedQuery ? createKoreanSearchRegex(trimmedQuery) : null;

  return endpoints.filter((endpoint) => {
    if (hasMethodFilter && hasTagFilter) {
      const matchesMethod = selectedMethods.includes(endpoint.method);
      const endpointTags = endpoint.operation.tags || [];
      const matchesTag = endpointTags.some((tag) => selectedTags.includes(tag));
      if (!matchesMethod && !matchesTag) {
        return false;
      }
    } else if (hasMethodFilter) {
      if (!selectedMethods.includes(endpoint.method)) {
        return false;
      }
    } else if (hasTagFilter) {
      const endpointTags = endpoint.operation.tags || [];
      if (!endpointTags.some((tag) => selectedTags.includes(tag))) {
        return false;
      }
    }

    if (searchRegex) {
      const path = endpoint.path;
      const method = endpoint.method;
      const summary = endpoint.operation.summary || '';
      const description = endpoint.operation.description || '';
      const operationId = endpoint.operation.operationId || '';
      const tags = (endpoint.operation.tags || []).join(' ');

      const searchableText = `${path} ${method} ${summary} ${description} ${operationId} ${tags}`;

      if (!searchRegex.test(searchableText)) {
        return false;
      }
    }

    return true;
  });
}

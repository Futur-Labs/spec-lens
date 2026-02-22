import type { ParsedEndpoint } from '@/entities/api-spec';
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

    if (searchQuery && searchQuery.trim()) {
      const queryTerms = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      const path = endpoint.path.toLowerCase();
      const summary = (endpoint.operation.summary || '').toLowerCase();
      const description = (endpoint.operation.description || '').toLowerCase();
      const operationId = (endpoint.operation.operationId || '').toLowerCase();
      const tags = (endpoint.operation.tags || []).join(' ').toLowerCase();

      const searchableText = `${path} ${summary} ${description} ${operationId} ${tags}`;

      const allTermsMatch = queryTerms.every((term) => searchableText.includes(term));
      if (!allTermsMatch) {
        return false;
      }
    }

    return true;
  });
}

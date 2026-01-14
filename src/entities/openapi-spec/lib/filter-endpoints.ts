import type { ParsedEndpoint } from '../model/openapi-types.ts';
import type { HttpMethod } from '@/shared/type';

/**
 * Filter endpoints by search query, tags, and methods
 */
export function filterEndpoints(
  endpoints: ParsedEndpoint[],
  options: {
    searchQuery?: string;
    selectedTags?: string[];
    selectedMethods?: HttpMethod[];
  },
): ParsedEndpoint[] {
  const { searchQuery, selectedTags, selectedMethods } = options;

  return endpoints.filter((endpoint) => {
    // Filter by method
    if (selectedMethods && selectedMethods.length > 0) {
      if (!selectedMethods.includes(endpoint.method)) {
        return false;
      }
    }

    // Filter by tag
    if (selectedTags && selectedTags.length > 0) {
      const endpointTags = endpoint.operation.tags || [];
      if (!endpointTags.some((tag) => selectedTags.includes(tag))) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      // Split query by spaces for multi-term search (all terms must match)
      const queryTerms = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      // Build searchable text from all relevant fields
      const path = endpoint.path.toLowerCase();
      const summary = (endpoint.operation.summary || '').toLowerCase();
      const description = (endpoint.operation.description || '').toLowerCase();
      const operationId = (endpoint.operation.operationId || '').toLowerCase();
      const tags = (endpoint.operation.tags || []).join(' ').toLowerCase();

      const searchableText = `${path} ${summary} ${description} ${operationId} ${tags}`;

      // All query terms must be found in the searchable text
      const allTermsMatch = queryTerms.every((term) => searchableText.includes(term));
      if (!allTermsMatch) {
        return false;
      }
    }

    return true;
  });
}

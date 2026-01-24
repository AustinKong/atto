import { queryOptions } from '@tanstack/react-query';

import type { ListingDraft } from '@/types/listingDraft';

/**
 * Query options factory for listing draft-related queries.
 * Listing drafts are client-side only state, never synced to server.
 */
export const listingDraftQueries = {
  all: () =>
    queryOptions({
      queryKey: ['listing-drafts'] as const,
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: false,
      initialData: [],
      queryFn: async (): Promise<ListingDraft[]> => {
        throw new Error('Listing drafts are managed entirely client-side');
      },
    }),
};

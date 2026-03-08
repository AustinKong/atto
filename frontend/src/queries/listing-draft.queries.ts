import { queryOptions } from '@tanstack/react-query';

import type { ListingDraft } from '@/types/listing-draft.types';

// Listing drafts are client-side only state, never synced to server.
export const listingDraftQueries = {
  list: () =>
    queryOptions({
      queryKey: ['listing-draft'] as const,
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: false,
      initialData: [],
      queryFn: async (): Promise<ListingDraft[]> => {
        throw new Error('Listing drafts are managed entirely client-side');
      },
    }),
};

import { useQuery } from '@tanstack/react-query';

import type { ListingDraft } from '@/types/listingDraft';

// Client-side state, never synced to server
export function useListingDraftsQuery() {
  const query = useQuery<ListingDraft[]>({
    queryKey: ['listing-drafts'],
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: false,
    initialData: [],
    queryFn: async () => {
      throw new Error('Listing drafts are managed entirely client-side');
    },
  });

  return {
    listingDrafts: query.data,
    ...query,
  };
}

import { useQuery } from '@tanstack/react-query';

import type { ListingDraft } from '@/types/listingDraft';

// Client-side state, never synced to server
export function useListingDraftsQuery() {
  const query = useQuery<ListingDraft[]>({
    queryKey: ['listings'],
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: false,
    initialData: [],
  });

  return {
    listingDrafts: query.data,
    ...query,
  };
}

import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';
import { z } from 'zod';

import { listingsQueries } from '@/queries/listing.queries';
import { validateParams } from '@/utils/params.utils';

const ListingParams = z.object({
  listingId: z.uuid(),
});

export function listingsLoader(queryClient: QueryClient) {
  return async () => {
    return queryClient.prefetchInfiniteQuery(listingsQueries.list());
  };
}

export function listingLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { listingId } = validateParams(ListingParams, params);
    const listing = await queryClient.ensureQueryData(listingsQueries.item(listingId));
    return { listing };
  };
}

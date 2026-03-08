import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
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

export function applicationsListRedirectLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { listingId } = validateParams(ListingParams, params);
    const listing = await queryClient.ensureQueryData(listingsQueries.item(listingId));

    if (listing.applications.length > 0) {
      return redirect(`/listings/${listingId}/applications/${listing.applications[0].id}`);
    }

    return null;
  };
}

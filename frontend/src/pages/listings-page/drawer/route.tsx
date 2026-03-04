import { Center, Spinner } from '@chakra-ui/react';
import type { QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { LoaderFunctionArgs } from 'react-router';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { listingsQueries } from '@/queries/listings';

import { applicationsRoute } from './applications/route.tsx';
import { ListingDrawer } from './index';
import { infoRoute } from './info/route';
import { researchRoute } from './research/route';

function listingLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const listingId = params.listingId;
    const listing = await queryClient.ensureQueryData(listingsQueries.item(listingId!));
    // TODO: Make this a separate fn so its reusable
    return { breadcrumb: `${listing.title} at ${listing.company}` };
  };
}

export const listingDrawerRoute = (queryClient: QueryClient) => ({
  path: ':listingId',
  element: (
    <Suspense
      fallback={
        <Center h="full">
          <Spinner />
        </Center>
      }
    >
      <ListingDrawer />
    </Suspense>
  ),
  loader: listingLoader(queryClient),
  errorElement: <ErrorElement />,
  children: [infoRoute(), researchRoute(), applicationsRoute(queryClient)],
});

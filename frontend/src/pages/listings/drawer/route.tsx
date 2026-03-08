import { Center, Spinner } from '@chakra-ui/react';
import type { QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { listingLoader } from '@/loaders/listing.loaders';
import type { Listing } from '@/types/listing.types';
import { formatListingBreadcrumb } from '@/utils/formatters/listing.formatters';

import { applicationsRoute } from './applications/route.tsx';
import { ListingDrawer } from './index';
import { infoRoute } from './info/route';
import { researchRoute } from './research/route';

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
  handle: {
    breadcrumb: (data: { listing: Listing }) => formatListingBreadcrumb(data.listing),
  },
  errorElement: <ErrorElement />,
  children: [infoRoute(), researchRoute(), applicationsRoute(queryClient)],
});

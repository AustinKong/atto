import type { QueryClient } from '@tanstack/react-query';

import { listingLoader } from '@/loaders/listing.loaders';
import { baseRoute } from '@/routes';
import type { Listing } from '@/types/listing.types';
import { formatListingBreadcrumb } from '@/utils/formatters/listing.formatters';

import { ListingDrawer } from './index';

export function listingDrawerRoute(queryClient: QueryClient) {
  return baseRoute({
    path: ':listingId',
    element: <ListingDrawer />,
    loader: listingLoader(queryClient),
    handle: {
      breadcrumb: (data: { listing: Listing }) => formatListingBreadcrumb(data.listing),
    },
  });
}

import type { QueryClient } from '@tanstack/react-query';

import { listingsLoader } from '@/loaders/listing.loaders';
import { baseRoute } from '@/routes';

import { listingDrawerRoute } from './drawer/route.tsx';
import { ListingsPage } from './index';

export function listingsRoute(queryClient: QueryClient) {
  return baseRoute({
    path: 'listings',
    element: <ListingsPage />,
    loader: listingsLoader(queryClient),
    handle: { breadcrumb: 'Listings' },
    children: [listingDrawerRoute(queryClient)],
  });
}

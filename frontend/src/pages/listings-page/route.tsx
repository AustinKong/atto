import type { QueryClient } from '@tanstack/react-query';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { listingsLoader } from '@/loaders/listings.ts';

import { listingDrawerRoute } from './drawer/route.tsx';
import { ListingsPage } from './index';

export function listingsRoute(queryClient: QueryClient) {
  return {
    path: 'listings',
    element: <ListingsPage />,
    loader: listingsLoader(queryClient),
    handle: { breadcrumb: 'Listings' },
    errorElement: <ErrorElement />,
    children: [listingDrawerRoute(queryClient)],
  };
}

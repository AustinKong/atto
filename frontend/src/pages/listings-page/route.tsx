import type { QueryClient } from '@tanstack/react-query';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { listingsQueries } from '@/queries/listings';

import { listingDrawerRoute } from './drawer/route.tsx';
import { ListingsPage } from './index';

function listingsLoader(queryClient: QueryClient) {
  return async () => {
    return queryClient.ensureQueryData(listingsQueries.all());
  };
}

export function listingsRoute(queryClient: QueryClient) {
  return {
    path: 'listings',
    element: <ListingsPage />,
    loader: listingsLoader(queryClient),
    errorElement: <ErrorElement />,
    children: [listingDrawerRoute(queryClient)],
  };
}

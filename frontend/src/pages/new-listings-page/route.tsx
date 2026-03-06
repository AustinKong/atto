import { ErrorElement } from '@/components/ui/ErrorBoundary';

import { NewListingsPage } from './index';

function newListingsLoader() {
  return async () => {
    // Listing drafts are client-side only, no server data to preload
    return {
      breadcrumb: [
        ['Listings', '/listings'],
        ['New', '/listings/new'],
      ] as [string, string][],
    };
  };
}

export function newListingsRoute() {
  return {
    path: 'listings/new',
    element: <NewListingsPage />,
    loader: newListingsLoader(),
    errorElement: <ErrorElement />,
  };
}

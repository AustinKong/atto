import { ErrorElement } from '@/components/ui/ErrorBoundary';

import { NewListingsPage } from './index';

function newListingsLoader() {
  return async () => {
    // Listing drafts are client-side only, no server data to preload
    return null;
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

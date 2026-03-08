import { ErrorElement } from '@/components/ui/ErrorBoundary';

import { NewListingsPage } from './index';

export function newListingsRoute() {
  return {
    path: 'listings',
    handle: {
      breadcrumb: 'Listings',
    },
    children: [
      {
        path: 'new',
        handle: { breadcrumb: 'New' },
        element: <NewListingsPage />,
        errorElement: <ErrorElement />,
      },
    ],
  };
}

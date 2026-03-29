import { baseRoute } from '@/routes';

import { NewListingsPage } from './index';

export function newListingsRoute() {
  return {
    path: 'listings',
    handle: {
      breadcrumb: 'Listings',
    },
    children: [
      baseRoute({
        path: 'new',
        handle: { breadcrumb: 'New' },
        element: <NewListingsPage />,
      }),
    ],
  };
}

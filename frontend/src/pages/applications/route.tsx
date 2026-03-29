import type { QueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router';

import { applicationLoader } from '@/loaders/application.loaders';
import { applicationsListRedirectLoader, listingLoader } from '@/loaders/listing.loaders';
import { baseRoute } from '@/routes';
import type { Application } from '@/types/application.types';
import type { Listing } from '@/types/listing.types';
import { formatApplicationStatusDisplay } from '@/utils/formatters/application.formatters';
import { formatListingBreadcrumb } from '@/utils/formatters/listing.formatters';

import { ApplicationsEmpty } from './index';
import { ApplicationsPage as Applications } from './index-new';

export function applicationsRoute(queryClient: QueryClient) {
  return {
    path: 'listings',
    handle: { breadcrumb: 'Listings' },
    children: [
      {
        path: ':listingId',
        loader: listingLoader(queryClient),
        handle: {
          breadcrumb: (data: { listing: Listing }) => formatListingBreadcrumb(data.listing),
        },
        children: [
          baseRoute({
            path: 'applications',
            handle: { breadcrumb: 'Applications' },
            element: <Outlet />,
            children: [
              {
                index: true,
                element: <ApplicationsEmpty />,
                loader: applicationsListRedirectLoader(queryClient),
              },
              baseRoute({
                path: ':applicationId',
                element: <Applications />,
                loader: applicationLoader(queryClient),
                handle: {
                  breadcrumb: (data: { application: Application }) =>
                    formatApplicationStatusDisplay(data.application),
                },
              }),
            ],
          }),
        ],
      },
    ],
  };
}

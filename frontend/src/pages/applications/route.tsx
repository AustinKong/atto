import type { QueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { applicationLoader } from '@/loaders/application.loaders';
import { applicationsListRedirectLoader, listingLoader } from '@/loaders/listing.loaders';
import type { Application } from '@/types/application.types';
import type { Listing } from '@/types/listing.types';
import { formatApplicationStatusDisplay } from '@/utils/formatters/application.formatters';
import { formatListingBreadcrumb } from '@/utils/formatters/listing.formatters';

import { Applications, ApplicationsEmpty } from './index';

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
          {
            path: 'applications',
            handle: { breadcrumb: 'Applications' },
            element: <Outlet />,
            errorElement: <ErrorElement />,
            children: [
              {
                index: true,
                element: <ApplicationsEmpty />,
                loader: applicationsListRedirectLoader(queryClient),
              },
              {
                path: ':applicationId',
                element: <Applications />,
                loader: applicationLoader(queryClient),
                handle: {
                  breadcrumb: (data: { application: Application }) =>
                    formatApplicationStatusDisplay(data.application),
                },
                errorElement: <ErrorElement />,
              },
            ],
          },
        ],
      },
    ],
  };
}

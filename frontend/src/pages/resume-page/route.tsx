import type { QueryClient } from '@tanstack/react-query';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { applicationLoader } from '@/loaders/applications';
import { listingLoader } from '@/loaders/listings';
import { resumeLoader } from '@/loaders/resumes';
import type { Application } from '@/types/application';
import type { Listing } from '@/types/listing';
import { formatApplicationStatusDisplay } from '@/utils/formatters/applications';
import { formatListingBreadcrumb } from '@/utils/formatters/listings';

import { TemplatesPage } from '../templates-page';
import { ResumePage } from './index';

export function resumeRoute(queryClient: QueryClient) {
  return {
    path: 'resumes/:resumeId',
    loader: resumeLoader(queryClient),
    handle: { breadcrumb: 'Resume' },
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <ResumePage />,
      },
      {
        path: 'templates',
        element: <TemplatesPage />,
        handle: { breadcrumb: 'Templates' },
      },
    ],
  };
}

export function applicationResumeRoute(queryClient: QueryClient) {
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
            children: [
              {
                path: ':applicationId',
                loader: applicationLoader(queryClient),
                handle: {
                  breadcrumb: (data: { application: Application }) =>
                    formatApplicationStatusDisplay(data.application),
                },
                children: [
                  {
                    path: 'resumes/:resumeId',
                    loader: resumeLoader(queryClient),
                    handle: { breadcrumb: 'Resume' },
                    children: [
                      {
                        index: true,
                        element: <ResumePage />,
                      },
                      {
                        path: 'templates',
                        element: <TemplatesPage />,
                        handle: { breadcrumb: 'Templates' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

import type { QueryClient } from '@tanstack/react-query';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { applicationLoader } from '@/loaders/application.loaders';
import { listingLoader } from '@/loaders/listing.loaders';
import { resumeLoader } from '@/loaders/resume.loaders';
import type { Application } from '@/types/application.types';
import type { Listing } from '@/types/listing.types';
import { formatApplicationStatusDisplay } from '@/utils/formatters/application.formatters';
import { formatListingBreadcrumb } from '@/utils/formatters/listing.formatters';

import { TemplatesPage } from '../templates';
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

import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { getStatusText } from '@/constants/statuses';
import { applicationQueries } from '@/queries/applications';
import { listingsQueries } from '@/queries/listings';
import { resumeQueries } from '@/queries/resume';
import { DateFormatPresets, ISODate } from '@/utils/date';

import { ResumePage } from './index';

// TODO: DRY these loaders? Or maybe dry-ing the function to generate display text is enough
function resumeLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { resumeId } = params;
    if (!resumeId) throw new Error('Resume ID is required');

    const resume = await queryClient.ensureQueryData(resumeQueries.item(resumeId));
    return { resume };
  };
}

function listingLoaderForBreadcrumb(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const listing = await queryClient.ensureQueryData(listingsQueries.item(params.listingId!));
    return { breadcrumb: `${listing.title} at ${listing.company}` };
  };
}

function applicationLoaderForBreadcrumb(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const application = await queryClient.ensureQueryData(
      applicationQueries.item(params.applicationId!)
    );
    const lastStatusEvent = application.statusEvents[application.statusEvents.length - 1];
    const statusText = getStatusText(lastStatusEvent);
    const date = ISODate.format(lastStatusEvent.date, DateFormatPresets.monthDay);
    return { breadcrumb: `${date} (${statusText})` };
  };
}

// /listings/:listingId/applications/:applicationId/resumes/:resumeId
export function applicationResumeRoute(queryClient: QueryClient) {
  return {
    path: 'listings/:listingId',
    loader: listingLoaderForBreadcrumb(queryClient),
    handle: { breadcrumb: undefined }, // label comes from loader
    errorElement: <ErrorElement />,
    children: [
      {
        path: 'applications',
        handle: { breadcrumb: 'Applications' },
        children: [
          {
            path: ':applicationId',
            loader: applicationLoaderForBreadcrumb(queryClient),
            errorElement: <ErrorElement />,
            children: [
              {
                path: 'resumes/:resumeId',
                element: <ResumePage />,
                loader: resumeLoader(queryClient),
                handle: { breadcrumb: 'Resume' },
                errorElement: <ErrorElement />,
              },
            ],
          },
        ],
      },
    ],
  };
}

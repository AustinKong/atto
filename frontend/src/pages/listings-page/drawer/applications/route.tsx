import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';
import { Outlet, redirect } from 'react-router';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { getStatusText } from '@/constants/statuses';
import { applicationQueries } from '@/queries/applications';
import { listingsQueries } from '@/queries/listings';
import { DateFormatPresets, ISODate } from '@/utils/date';

import { Applications, ApplicationsEmpty } from './index';

function applicationLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const applicationId = params.applicationId;
    const application = await queryClient.ensureQueryData(applicationQueries.item(applicationId!));

    const lastStatusEvent = application.statusEvents[application.statusEvents.length - 1];
    const statusText = getStatusText(lastStatusEvent);
    const date = ISODate.format(lastStatusEvent.date, DateFormatPresets.monthDay);

    return { breadcrumb: `${date} (${statusText})` };
  };
}

function applicationsLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const listingId = params.listingId;
    const listing = await queryClient.ensureQueryData(listingsQueries.item(listingId!));

    if (listing.applications && listing.applications.length > 0 && listing.applications[0].id) {
      return redirect(`/listings/${listingId}/applications/${listing.applications[0].id}`);
    }

    return null;
  };
}

export function applicationsRoute(queryClient: QueryClient) {
  return {
    path: 'applications',
    handle: { breadcrumb: 'Applications' },
    element: <Outlet />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <ApplicationsEmpty />,
        loader: applicationsLoader(queryClient),
      },
      {
        path: ':applicationId',
        element: <Applications />,
        loader: applicationLoader(queryClient),
        errorElement: <ErrorElement />,
      },
    ],
  };
}

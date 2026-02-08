import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';
import { Outlet, redirect } from 'react-router';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { listingsQueries } from '@/queries/listings';

import { Applications, ApplicationsEmpty } from './index';

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
        errorElement: <ErrorElement />,
      },
    ],
  };
}

import type { QueryClient } from '@tanstack/react-query';
import { type LoaderFunctionArgs, Outlet, redirect } from 'react-router';
import { z } from 'zod';

import { applicationLoader } from '@/loaders/application.loaders';
import { listingsQueries } from '@/queries/listing.queries';
import { baseRoute } from '@/routes';
import type { Application } from '@/types/application.types';
import { validateParams } from '@/utils/params.utils';

import { Applications } from './index';

const ListingParams = z.object({
  listingId: z.uuid(),
});

export function applicationsRoute(queryClient: QueryClient) {
  return baseRoute({
    path: 'applications',
    element: Outlet,
    handle: { breadcrumb: 'Applications' },
    children: [
      baseRoute({
        index: true,
        element: <Applications />,
        loader: applicationsIndexLoader(queryClient),
      }),
      baseRoute({
        path: ':applicationId',
        element: <Applications />,
        loader: applicationLoader(queryClient),
        handle: {
          breadcrumb: (data: { application: Application }) => data.application.name,
        },
      }),
    ],
  });
}

function applicationsIndexLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { listingId } = validateParams(ListingParams, params);
    const listing = await queryClient.ensureQueryData(listingsQueries.item(listingId));
    const firstApplication = listing.applications[0];

    if (!firstApplication) {
      return null;
    }

    return redirect(`/listings/${listingId}/applications/${firstApplication.id}`);
  };
}

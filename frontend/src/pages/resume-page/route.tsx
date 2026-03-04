import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { getStatusText } from '@/constants/statuses';
import { applicationQueries } from '@/queries/applications';
import { listingsQueries } from '@/queries/listings';
import { resumeQueries } from '@/queries/resume';
import { DateFormatPresets, ISODate } from '@/utils/date';

import { ResumePage } from './index';

function resumeLoader(queryClient: QueryClient) {
  return async ({ params, request }: LoaderFunctionArgs) => {
    const { resumeId } = params;
    if (!resumeId) throw new Error('Resume ID is required');

    const url = new URL(request.url);
    const applicationId = url.searchParams.get('applicationId');
    const listingId = url.searchParams.get('listingId');

    const resume = await queryClient.ensureQueryData(resumeQueries.item(resumeId));

    let breadcrumb: string | [string, string][] = 'Resume';

    // If coming from an application context, construct full breadcrumb
    if (applicationId && listingId) {
      const listing = await queryClient.ensureQueryData(listingsQueries.item(listingId));
      const application = await queryClient.ensureQueryData(applicationQueries.item(applicationId));

      const lastStatusEvent = application.statusEvents[application.statusEvents.length - 1];
      const statusText = getStatusText(lastStatusEvent);
      const date = ISODate.format(lastStatusEvent.date, DateFormatPresets.monthDay);
      const appLabel = `${date} (${statusText})`;

      breadcrumb = [
        ['Listings', '/listings'],
        [`${listing.title} at ${listing.company}`, `/listings/${listingId}`],
        ['Applications', `/listings/${listingId}/applications`],
        [appLabel, `/listings/${listingId}/applications/${applicationId}`],
        ['Resume', '#'],
      ];
    }

    return {
      resume,
      breadcrumb,
    };
  };
}

export function resumeRoute(queryClient: QueryClient) {
  return {
    path: 'resumes/:resumeId',
    element: <ResumePage />,
    loader: resumeLoader(queryClient),
    handle: { breadcrumb: 'Resume' },
    errorElement: <ErrorElement />,
  };
}

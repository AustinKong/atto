import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { releaseNotesQueries } from '@/queries/releaseNotes';

import { ReleaseNotesPage } from './index';

function releaseNotesLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const version = params.version;

    if (!version) {
      throw new Error('Version parameter is required');
    }

    return queryClient.ensureQueryData(releaseNotesQueries.item(version));
  };
}

export function releaseNotesRoute(queryClient: QueryClient) {
  return {
    path: 'release-notes/:version',
    element: <ReleaseNotesPage />,
    loader: releaseNotesLoader(queryClient),
    errorElement: <ErrorElement />,
  };
}

import type { QueryClient } from '@tanstack/react-query';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { releaseNotesQueries } from '@/queries/releaseNotes';

import { ReleaseNotesPage } from './index';

function releaseNotesLoader(queryClient: QueryClient) {
  return async () => {
    return queryClient.ensureQueryData(releaseNotesQueries.latest());
  };
}

export function releaseNotesRoute(queryClient: QueryClient) {
  return {
    path: 'release-notes',
    element: <ReleaseNotesPage />,
    loader: releaseNotesLoader(queryClient),
    errorElement: <ErrorElement />,
  };
}

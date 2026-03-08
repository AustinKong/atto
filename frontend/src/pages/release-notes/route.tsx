import type { QueryClient } from '@tanstack/react-query';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { releaseNotesLoader } from '@/loaders/release-notes.loaders';

import { ReleaseNotesPage } from './index';

export function releaseNotesRoute(queryClient: QueryClient) {
  return {
    path: 'release-notes/:version',
    element: <ReleaseNotesPage />,
    loader: releaseNotesLoader(queryClient),
    handle: { breadcrumb: 'Release Notes' },
    errorElement: <ErrorElement />,
  };
}

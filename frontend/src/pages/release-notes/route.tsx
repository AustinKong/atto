import type { QueryClient } from '@tanstack/react-query';

import { releaseNotesLoader } from '@/loaders/release-notes.loaders';
import { baseRoute } from '@/routes';

import { ReleaseNotesPage } from './index';

export function releaseNotesRoute(queryClient: QueryClient) {
  return baseRoute({
    path: 'release-notes/:version',
    element: <ReleaseNotesPage />,
    loader: releaseNotesLoader(queryClient),
    handle: { breadcrumb: 'Release Notes' },
  });
}

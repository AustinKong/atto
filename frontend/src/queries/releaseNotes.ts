import { queryOptions } from '@tanstack/react-query';

import { getLatestVersion, getReleaseNotes } from '@/services/releaseNotes';

export const releaseNotesQueries = {
  latestVersion: () =>
    queryOptions({
      queryKey: ['release-notes-version', 'latest'],
      queryFn: getLatestVersion,
      staleTime: 12 * 60 * 60 * 1000,
    }),
  item: (version: string) =>
    queryOptions({
      queryKey: ['release-notes', version],
      queryFn: () => getReleaseNotes(version),
      staleTime: 48 * 60 * 60 * 1000,
    }),
};

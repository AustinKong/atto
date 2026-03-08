import { queryOptions } from '@tanstack/react-query';

import { getLatestVersion, getReleaseNotes } from '@/services/release-notes.service';

export const releaseNotesQueries = {
  latestVersion: () =>
    queryOptions({
      queryKey: ['release-notes-version', 'latest'] as const,
      queryFn: getLatestVersion,
      staleTime: 12 * 60 * 60 * 1000,
    }),
  item: (version: string) =>
    queryOptions({
      queryKey: ['release-notes', version] as const,
      queryFn: () => getReleaseNotes(version),
      staleTime: 48 * 60 * 60 * 1000,
    }),
};

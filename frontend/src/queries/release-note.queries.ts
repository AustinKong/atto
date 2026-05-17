import { queryOptions } from '@tanstack/react-query';

import { getLatestVersion, getReleaseNotes } from '@/services/release-notes.service';

const releaseNotesQueryKeys = {
  latestVersion: () => ['release-note', 'latest-version'] as const,
  item: (version: string) => ['release-note', version] as const,
};

export const releaseNotesQueries = {
  keys: releaseNotesQueryKeys,
  latestVersion: () =>
    queryOptions({
      queryKey: releaseNotesQueryKeys.latestVersion(),
      queryFn: getLatestVersion,
      staleTime: 12 * 60 * 60 * 1000,
    }),
  item: (version: string) =>
    queryOptions({
      queryKey: releaseNotesQueryKeys.item(version),
      queryFn: () => getReleaseNotes(version),
      staleTime: 48 * 60 * 60 * 1000,
    }),
};

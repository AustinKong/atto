import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';
import { z } from 'zod';

import { releaseNotesQueries } from '@/queries/release-note.queries';
import { validateParams } from '@/utils/params.utils';

const ReleaseNotesParams = z.object({
  version: z
    .string()
    .regex(/^(\d+\.)?(\d+\.)?(\*|\d+)$/, 'Invalid version: must be a valid semver string'),
});

export function releaseNotesLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { version } = validateParams(ReleaseNotesParams, params);
    const releaseNotes = await queryClient.ensureQueryData(releaseNotesQueries.item(version));
    return { releaseNotes };
  };
}

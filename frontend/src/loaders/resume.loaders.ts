import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';
import { z } from 'zod';

import { profileQueries } from '@/queries/profile.queries';
import { resumeQueries } from '@/queries/resume.queries';
import { validateParams } from '@/utils/params.utils';

const ResumeParams = z.object({
  resumeId: z.uuid(),
});

export function resumeLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { resumeId } = validateParams(ResumeParams, params);
    const [resume] = await Promise.all([
      queryClient.ensureQueryData(resumeQueries.item(resumeId)),
      queryClient.ensureQueryData(profileQueries.list()),
    ]);
    return { resume };
  };
}

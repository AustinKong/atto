import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';
import { z } from 'zod';

import { resumeQueries } from '@/queries/resume';
import { validateParams } from '@/utils/params';

const ResumeParams = z.object({
  resumeId: z.uuid(),
});

export function resumeLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { resumeId } = validateParams(ResumeParams, params);
    const resume = await queryClient.ensureQueryData(resumeQueries.item(resumeId));
    return { resume };
  };
}

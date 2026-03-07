import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';
import { z } from 'zod';

import { applicationQueries } from '@/queries/applications';
import { validateParams } from '@/utils/params';

const ApplicationParams = z.object({
  applicationId: z.uuid(),
});

export function applicationLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { applicationId } = validateParams(ApplicationParams, params);
    const application = await queryClient.ensureQueryData(applicationQueries.item(applicationId));
    return { application };
  };
}

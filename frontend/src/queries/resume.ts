import { queryOptions } from '@tanstack/react-query';

import { getResume } from '@/services/resume';

export const resumeQueries = {
  item: (resumeId: string) =>
    queryOptions({
      queryKey: ['resume', resumeId] as const,
      queryFn: () => getResume(resumeId),
      enabled: !!resumeId,
      staleTime: Infinity,
      retry: false,
    }),
};

import { queryOptions } from '@tanstack/react-query';

import { getResume } from '@/services/resume.service';

const resumeQueryKeys = {
  item: (resumeId: string) => ['resume', resumeId] as const,
};

export const resumeQueries = {
  keys: resumeQueryKeys,
  item: (resumeId: string) =>
    queryOptions({
      queryKey: resumeQueryKeys.item(resumeId),
      queryFn: () => getResume(resumeId),
      enabled: !!resumeId,
      staleTime: Infinity,
      retry: false,
    }),
};

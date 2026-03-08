import { queryOptions } from '@tanstack/react-query';

import { getExperiences } from '@/services/experience.service';

export const experienceQueries = {
  list: () =>
    queryOptions({
      queryKey: ['experience'] as const,
      queryFn: getExperiences,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};

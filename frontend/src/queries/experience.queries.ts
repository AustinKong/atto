import { queryOptions } from '@tanstack/react-query';

import { getExperiences } from '@/services/experience.service';

const experienceQueryKeys = {
  list: () => ['experience'] as const,
};

export const experienceQueries = {
  keys: experienceQueryKeys,
  list: () =>
    queryOptions({
      queryKey: experienceQueryKeys.list(),
      queryFn: getExperiences,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};

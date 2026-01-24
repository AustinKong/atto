import { queryOptions } from '@tanstack/react-query';

import { getExperiences } from '@/services/experience';

/**
 * Query options factory for experience-related queries.
 * Use the factory to build strongly-typed query option objects that can be
 * consumed by loaders (prefetch via queryClient.ensureQueryData) or components
 * (via useQuery / useSuspenseQuery).
 */
export const experienceQueries = {
  list: () =>
    queryOptions({
      queryKey: ['experiences'] as const,
      queryFn: getExperiences,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};

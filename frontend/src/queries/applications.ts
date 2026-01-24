import { queryOptions } from '@tanstack/react-query';

import { getApplication } from '@/services/applications';

/**
 * Query options factory for application-related queries.
 * Use the factory to build strongly-typed query option objects that can be
 * consumed by loaders (prefetch via queryClient.ensureQueryData) or components
 * (via useQuery / useSuspenseQuery).
 */
export const applicationQueries = {
  // FIXME: Different naming convention?
  item: (id: string) =>
    queryOptions({
      queryKey: ['application', id] as const,
      queryFn: () => getApplication(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};

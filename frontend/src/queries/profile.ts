import { queryOptions } from '@tanstack/react-query';

import { getProfile } from '@/services/profile';

/**
 * Query options factory for profile-related queries.
 * Use the factory to build strongly-typed query option objects that can be
 * consumed by loaders (prefetch via queryClient.ensureQueryData) or components
 * (via useQuery / useSuspenseQuery).
 */
export const profileQueries = {
  item: () =>
    queryOptions({
      queryKey: ['profile'] as const,
      queryFn: getProfile,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};

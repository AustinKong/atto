import { queryOptions } from '@tanstack/react-query';

import { getProfile } from '@/services/profile';

export const profileQueries = {
  item: () =>
    queryOptions({
      queryKey: ['profile'] as const,
      queryFn: getProfile,
      staleTime: Infinity,
    }),
};

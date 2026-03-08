import { queryOptions } from '@tanstack/react-query';

import { getProfile } from '@/services/profile.service';

export const profileQueries = {
  list: () =>
    queryOptions({
      queryKey: ['profile'] as const,
      queryFn: getProfile,
      staleTime: Infinity,
    }),
};

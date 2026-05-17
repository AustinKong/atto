import { queryOptions } from '@tanstack/react-query';

import { getProfile } from '@/services/profile.service';

const profileQueryKeys = {
  list: () => ['profile'] as const,
};

export const profileQueries = {
  keys: profileQueryKeys,
  list: () =>
    queryOptions({
      queryKey: profileQueryKeys.list(),
      queryFn: getProfile,
      staleTime: Infinity,
    }),
};

import { queryOptions } from '@tanstack/react-query';

import { getSettings } from '@/services/setting.service';

const settingsQueryKeys = {
  list: () => ['setting'] as const,
};

export const settingsQueries = {
  keys: settingsQueryKeys,
  list: () =>
    queryOptions({
      queryKey: settingsQueryKeys.list(),
      queryFn: getSettings,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};

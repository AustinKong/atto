import { queryOptions } from '@tanstack/react-query';

import { getSettings } from '@/services/setting.service';

export const settingsQueries = {
  list: () =>
    queryOptions({
      queryKey: ['setting'] as const,
      queryFn: getSettings,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};

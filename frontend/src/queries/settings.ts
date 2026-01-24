import { queryOptions } from '@tanstack/react-query';

import { getSettings } from '@/services/settings';

export const settingsQueries = {
  all: () =>
    queryOptions({
      queryKey: ['settings'] as const,
      queryFn: getSettings,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};

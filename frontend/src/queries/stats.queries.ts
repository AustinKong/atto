import { queryOptions } from '@tanstack/react-query';

import { getStats } from '@/services/stats.service';
import type { StatsDateRange } from '@/types/stats.types';

export const statsQueries = {
  item: (startDate: StatsDateRange = '14d') =>
    queryOptions({
      queryKey: ['stats', startDate] as const,
      queryFn: () => getStats(startDate),
      staleTime: 60 * 1000,
    }),
};

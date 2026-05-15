import { queryOptions } from '@tanstack/react-query';

import { getStats } from '@/services/stats.service';
import type { StatsDateRange } from '@/types/stats.types';
import { DEFAULT_STATS_DATE_RANGE } from '@/utils/stats.utils';

export const statsQueries = {
  item: (dateRange: StatsDateRange = DEFAULT_STATS_DATE_RANGE) =>
    queryOptions({
      queryKey: ['stats', dateRange] as const,
      queryFn: () => getStats(dateRange),
      staleTime: 60 * 1000,
    }),
};

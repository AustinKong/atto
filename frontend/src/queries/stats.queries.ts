import { queryOptions } from '@tanstack/react-query';

import { getStats } from '@/services/stats.service';
import type { StatsDateRange } from '@/types/stats.types';
import { DEFAULT_STATS_DATE_RANGE } from '@/utils/stats.utils';

const statsQueryKeys = {
  item: (dateRange: StatsDateRange = DEFAULT_STATS_DATE_RANGE) =>
    ['stat', dateRange] as const,
};

export const statsQueries = {
  keys: statsQueryKeys,
  item: (dateRange: StatsDateRange = DEFAULT_STATS_DATE_RANGE) =>
    queryOptions({
      queryKey: statsQueryKeys.item(dateRange),
      queryFn: () => getStats(dateRange),
      staleTime: 60 * 1000,
    }),
};

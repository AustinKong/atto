import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';

import { statsQueries } from '@/queries/stats.queries';
import { STATS_DATE_RANGES, type StatsDateRange } from '@/types/stats.types';

const DEFAULT_STATS_DATE_RANGE: StatsDateRange = '14d';

export function statsLoader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const isAllowed = startDate && STATS_DATE_RANGES.includes(startDate as StatsDateRange);
    const dateRange = isAllowed ? (startDate as StatsDateRange) : DEFAULT_STATS_DATE_RANGE;

    await queryClient.ensureQueryData(statsQueries.item(dateRange));
    return null;
  };
}

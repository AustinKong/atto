import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';

import { statsQueries } from '@/queries/stats.queries';
import { parseStatsDateRangeOrDefault } from '@/utils/stats.utils';

export function statsLoader(queryClient: QueryClient) {
  return async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const dateRange = parseStatsDateRangeOrDefault(url.searchParams.get('range'));

    await queryClient.ensureQueryData(statsQueries.item(dateRange));
    return null;
  };
}
